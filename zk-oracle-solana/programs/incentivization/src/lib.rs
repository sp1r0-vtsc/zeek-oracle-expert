use anchor_lang::prelude::*;

declare_id!("IncentivizationProgram1111111111111111111111111");

#[program]
pub mod incentivization_program {
    use super::*;

    /// Initialize the incentive system with reward parameters
    pub fn initialize_incentive_system(
        ctx: Context<InitializeIncentiveSystem>,
        base_reward: u64,
        reward_parameters: RewardParameters,
    ) -> Result<()> {
        let incentive_account = &mut ctx.accounts.incentive_account;
        let authority = &ctx.accounts.authority;
        
        incentive_account.authority = authority.key();
        incentive_account.treasury = ctx.accounts.treasury.key();
        incentive_account.base_reward = base_reward;
        incentive_account.total_distributed = 0;
        incentive_account.reward_parameters = reward_parameters;
        
        emit!(IncentiveSystemInitialized {
            authority: authority.key(),
            treasury: ctx.accounts.treasury.key(),
            base_reward,
        });
        
        Ok(())
    }
    
    /// Stake tokens on a submission
    pub fn stake_on_submission(
        ctx: Context<StakeOnSubmission>,
        data_hash: [u8; 32],
        stake_amount: u64,
    ) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let staker = &ctx.accounts.staker;
        
        // Initialize stake account
        stake_account.staker = staker.key();
        stake_account.data_hash = data_hash;
        stake_account.stake_amount = stake_amount;
        stake_account.timestamp = Clock::get()?.unix_timestamp;
        stake_account.is_locked = true;
        stake_account.unlock_time = stake_account.timestamp + 60 * 60 * 24 * 7; // 7 day lock
        
        // Transfer tokens to stake account
        let cpi_accounts = Transfer {
            from: ctx.accounts.token_from.to_account_info(),
            to: ctx.accounts.stake_token_account.to_account_info(),
            authority: staker.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Transfer tokens
        transfer(cpi_ctx, stake_amount)?;
        
        emit!(StakeSubmitted {
            staker: staker.key(),
            data_hash,
            stake_amount,
            timestamp: stake_account.timestamp,
            unlock_time: stake_account.unlock_time,
        });
        
        Ok(())
    }
    
    /// Calculate and distribute rewards for validated submissions
    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
        data_hash: [u8; 32],
    ) -> Result<()> {
        let incentive_account = &ctx.accounts.incentive_account;
        let stake_account = &mut ctx.accounts.stake_account;
        let data_account = &ctx.accounts.data_account;
        let trust_score_account = &ctx.accounts.trust_score_account;
        
        // Ensure the data has been validated
        require!(
            data_account.validation_status == 1, // Validated status
            IncentivizationError::DataNotValidated
        );
        
        // Ensure the stake account is for this data
        require!(
            stake_account.data_hash == data_hash,
            IncentivizationError::StakeMismatch
        );
        
        // Ensure the claimer is the staker
        require!(
            stake_account.staker == ctx.accounts.claimer.key(),
            IncentivizationError::NotAuthorized
        );
        
        // Calculate reward
        let reward_amount = calculate_reward(
            incentive_account.base_reward,
            trust_score_account.base_score,
            data_account.uniqueness_value, // This would come from the data account in a real implementation
            data_account.difficulty_factor, // This would come from the data account in a real implementation
            stake_account.stake_amount,
        );
        
        // Transfer stake back to staker
        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_token_account.to_account_info(),
            to: ctx.accounts.token_destination.to_account_info(),
            authority: ctx.accounts.stake_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Transfer staked amount
        transfer(cpi_ctx, stake_account.stake_amount)?;
        
        // Transfer reward
        let cpi_accounts = Transfer {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            to: ctx.accounts.token_destination.to_account_info(),
            authority: ctx.accounts.treasury_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Transfer reward amount
        transfer(cpi_ctx, reward_amount)?;
        
        // Mark stake as claimed
        stake_account.is_locked = false;
        
        emit!(RewardsClaimed {
            claimer: ctx.accounts.claimer.key(),
            data_hash,
            stake_amount: stake_account.stake_amount,
            reward_amount,
        });
        
        Ok(())
    }
    
    /// Process slashing for incorrect information
    pub fn process_slashing(
        ctx: Context<ProcessSlashing>,
        data_hash: [u8; 32],
        intentionality_factor: u8, // 0-100, higher for suspected intentional misinformation
    ) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let data_account = &ctx.accounts.data_account;
        
        // Ensure the data has been rejected
        require!(
            data_account.validation_status == 2, // Rejected status
            IncentivizationError::DataNotRejected
        );
        
        // Ensure the stake account is for this data
        require!(
            stake_account.data_hash == data_hash,
            IncentivizationError::StakeMismatch
        );
        
        // Calculate slashing amount
        let intentionality = std::cmp::min(intentionality_factor, 100) as f64 / 100.0;
        let base_slash_percentage = 10.0 + (100.0 - data_account.trust_score as f64 / 10.0) * 0.7;
        let final_slash_percentage = base_slash_percentage * intentionality;
        let slash_amount = (stake_account.stake_amount as f64 * final_slash_percentage / 100.0) as u64;
        let return_amount = stake_account.stake_amount.saturating_sub(slash_amount);
        
        // Return partial stake to staker
        if return_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.stake_token_account.to_account_info(),
                to: ctx.accounts.token_destination.to_account_info(),
                authority: ctx.accounts.stake_authority.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            
            // Transfer remaining tokens after slashing
            transfer(cpi_ctx, return_amount)?;
        }
        
        // Transfer slashed amount to treasury
        if slash_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.stake_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.stake_authority.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            
            // Transfer slashed tokens to treasury
            transfer(cpi_ctx, slash_amount)?;
        }
        
        // Mark stake as processed
        stake_account.is_locked = false;
        
        emit!(SlashingProcessed {
            staker: stake_account.staker,
            data_hash,
            stake_amount: stake_account.stake_amount,
            slash_amount,
            return_amount,
            intentionality_factor,
        });
        
        Ok(())
    }
    
    /// Update reward parameters
    pub fn update_reward_parameters(
        ctx: Context<UpdateRewardParameters>,
        new_parameters: RewardParameters,
    ) -> Result<()> {
        let incentive_account = &mut ctx.accounts.incentive_account;
        let authority = &ctx.accounts.authority;
        
        // Ensure the updater is the authority
        require!(
            incentive_account.authority == authority.key(),
            IncentivizationError::NotAuthorized
        );
        
        // Update parameters
        incentive_account.reward_parameters = new_parameters;
        
        emit!(RewardParametersUpdated {
            authority: authority.key(),
            new_parameters,
        });
        
        Ok(())
    }
    
    /// Unlock expired stakes (if validation never completed)
    pub fn unlock_expired_stake(
        ctx: Context<UnlockExpiredStake>,
    ) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let current_time = Clock::get()?.unix_timestamp;
        
        // Ensure stake is still locked
        require!(
            stake_account.is_locked,
            IncentivizationError::StakeAlreadyUnlocked
        );
        
        // Ensure unlock time has passed
        require!(
            current_time >= stake_account.unlock_time,
            IncentivizationError::StakeStillLocked
        );
        
        // Return stake to staker
        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_token_account.to_account_info(),
            to: ctx.accounts.token_destination.to_account_info(),
            authority: ctx.accounts.stake_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Transfer staked amount
        transfer(cpi_ctx, stake_account.stake_amount)?;
        
        // Mark stake as unlocked
        stake_account.is_locked = false;
        
        emit!(StakeUnlocked {
            staker: stake_account.staker,
            data_hash: stake_account.data_hash,
            stake_amount: stake_account.stake_amount,
            unlock_time: stake_account.unlock_time,
        });
        
        Ok(())
    }
}

/// Calculate reward based on parameters
/// This could be much more sophisticated in a production system
fn calculate_reward(
    base_reward: u64,
    trust_score: u32,
    uniqueness_value: u32,
    difficulty_factor: u32,
    stake: u64,
) -> u64 {
    // Trust score multiplier (0.5 - 2.0)
    let trust_multiplier = 0.5 + (trust_score as f64 / 1000.0) * 1.5;
    
    // Uniqueness value (1.0 - 3.0)
    // Higher for novel information
    let uniqueness_multiplier = 1.0 + (uniqueness_value as f64 / 500.0) * 2.0;
    
    // Difficulty factor (1.0 - 2.0)
    // Higher for specialized domains
    let difficulty_multiplier = 1.0 + (difficulty_factor as f64 / 1000.0);
    
    // Stake risk multiplier (1.0 - 1.5)
    // Higher rewards for higher stake amounts
    let stake_multiplier = 1.0 + (stake.min(10000) as f64 / 10000.0) * 0.5;
    
    // Calculate final reward
    let reward = base_reward as f64 * 
                trust_multiplier * 
                uniqueness_multiplier * 
                difficulty_multiplier * 
                stake_multiplier;
    
    reward as u64
}

/// External CPI function to transfer tokens
/// In a real implementation, this would use the actual SPL token program
fn transfer<'a, 'b, 'c, 'info>(
    ctx: CpiContext<'a, 'b, 'c, 'info, Transfer<'info>>,
    amount: u64,
) -> Result<()> {
    // This is a placeholder for the actual token transfer logic
    // In a real implementation, this would call token::transfer
    Ok(())
}

/// External CPI accounts for token transfer
pub struct Transfer<'info> {
    pub from: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct InitializeIncentiveSystem<'info> {
    #[account(init, payer = authority, space = 8 + IncentiveAccount::INIT_SPACE)]
    pub incentive_account: Account<'info, IncentiveAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Treasury account that will hold and distribute tokens
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(data_hash: [u8; 32], stake_amount: u64)]
pub struct StakeOnSubmission<'info> {
    #[account(init, payer = staker, space = 8 + StakeAccount::INIT_SPACE)]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(mut)]
    pub staker: Signer<'info>,
    
    /// Token account to transfer from
    #[account(mut)]
    pub token_from: AccountInfo<'info>,
    
    /// Token account to hold the stake
    #[account(mut)]
    pub stake_token_account: AccountInfo<'info>,
    
    /// Token program for transfers
    pub token_program: Program<'info, Token>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(data_hash: [u8; 32])]
pub struct ClaimRewards<'info> {
    /// Incentive system account
    pub incentive_account: Account<'info, IncentiveAccount>,
    
    /// Stake account for the submission
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    
    /// Oracle data account
    pub data_account: Account<'info, DataAccount>,
    
    /// Trust score account
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    /// Claimer (must be the original staker)
    pub claimer: Signer<'info>,
    
    /// Authority for the stake account (program or multisig)
    pub stake_authority: AccountInfo<'info>,
    
    /// Authority for the treasury account
    pub treasury_authority: AccountInfo<'info>,
    
    /// Token account holding the stake
    #[account(mut)]
    pub stake_token_account: AccountInfo<'info>,
    
    /// Treasury token account for rewards
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    
    /// Destination for returned stake and rewards
    #[account(mut)]
    pub token_destination: AccountInfo<'info>,
    
    /// Token program for transfers
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(data_hash: [u8; 32], intentionality_factor: u8)]
pub struct ProcessSlashing<'info> {
    /// Stake account for the submission
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    
    /// Oracle data account
    pub data_account: Account<'info, DataAccount>,
    
    /// Authority for the stake account (program or multisig)
    pub stake_authority: AccountInfo<'info>,
    
    /// Token account holding the stake
    #[account(mut)]
    pub stake_token_account: AccountInfo<'info>,
    
    /// Treasury token account for slashed tokens
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    
    /// Destination for remaining tokens after slashing
    #[account(mut)]
    pub token_destination: AccountInfo<'info>,
    
    /// Token program for transfers
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateRewardParameters<'info> {
    #[account(mut)]
    pub incentive_account: Account<'info, IncentiveAccount>,
    
    /// Must be the authority on the incentive account
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnlockExpiredStake<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    
    /// Authority for the stake account (program or multisig)
    pub stake_authority: AccountInfo<'info>,
    
    /// Token account holding the stake
    #[account(mut)]
    pub stake_token_account: AccountInfo<'info>,
    
    /// Destination for returned stake
    #[account(mut)]
    pub token_destination: AccountInfo<'info>,
    
    /// Token program for transfers
    pub token_program: Program<'info, Token>,
}

/// External account structures from other programs
#[account]
pub struct DataAccount {
    pub validation_status: u8,
    pub trust_score: u32,
    pub uniqueness_value: u32, // This would be calculated by the oracle program
    pub difficulty_factor: u32, // This would be set based on the data category
    // Other fields not used in this program
}

#[account]
pub struct TrustScoreAccount {
    pub base_score: u32,
    // Other fields not used in this program
}

/// Token program struct
pub struct Token;

/// Incentive system account
#[account]
pub struct IncentiveAccount {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub base_reward: u64,
    pub total_distributed: u64,
    pub reward_parameters: RewardParameters,
}

impl IncentiveAccount {
    pub const INIT_SPACE: usize = 32 + // authority
                                 32 + // treasury
                                 8 + // base_reward
                                 8 + // total_distributed
                                 RewardParameters::SIZE; // reward parameters
}

/// Stake account for submissions
#[account]
pub struct StakeAccount {
    pub staker: Pubkey,
    pub data_hash: [u8; 32],
    pub stake_amount: u64,
    pub timestamp: i64,
    pub is_locked: bool,
    pub unlock_time: i64,
}

impl StakeAccount {
    pub const INIT_SPACE: usize = 32 + // staker
                                 32 + // data_hash
                                 8 + // stake_amount
                                 8 + // timestamp
                                 1 + // is_locked
                                 8; // unlock_time
}

/// Reward parameters struct
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct RewardParameters {
    pub trust_weight: u8,       // Weight of trust score in reward calculation (0-100)
    pub uniqueness_weight: u8,  // Weight of uniqueness in reward calculation (0-100)
    pub difficulty_weight: u8,  // Weight of difficulty in reward calculation (0-100)
    pub stake_weight: u8,       // Weight of stake in reward calculation (0-100)
    pub min_validators: u8,     // Minimum validators required for reward
    pub challenge_period: u32,  // Period in seconds during which rewards can be challenged
    pub slashing_percentage: u8, // Base percentage for slashing (0-100)
}

impl RewardParameters {
    pub const SIZE: usize = 1 + // trust_weight
                           1 + // uniqueness_weight
                           1 + // difficulty_weight
                           1 + // stake_weight
                           1 + // min_validators
                           4 + // challenge_period
                           1; // slashing_percentage
}

#[error_code]
pub enum IncentivizationError {
    #[msg("Not authorized to perform this action")]
    NotAuthorized,
    
    #[msg("Data has not been validated")]
    DataNotValidated,
    
    #[msg("Data has not been rejected")]
    DataNotRejected,
    
    #[msg("Stake account doesn't match the specified data")]
    StakeMismatch,
    
    #[msg("Stake is still locked")]
    StakeStillLocked,
    
    #[msg("Stake has already been unlocked")]
    StakeAlreadyUnlocked,
}

// Events
#[event]
pub struct IncentiveSystemInitialized {
    #[index]
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub base_reward: u64,
}

#[event]
pub struct StakeSubmitted {
    #[index]
    pub staker: Pubkey,
    pub data_hash: [u8; 32],
    pub stake_amount: u64,
    pub timestamp: i64,
    pub unlock_time: i64,
}

#[event]
pub struct RewardsClaimed {
    #[index]
    pub claimer: Pubkey,
    pub data_hash: [u8; 32],
    pub stake_amount: u64,
    pub reward_amount: u64,
}

#[event]
pub struct SlashingProcessed {
    #[index]
    pub staker: Pubkey,
    pub data_hash: [u8; 32],
    pub stake_amount: u64,
    pub slash_amount: u64,
    pub return_amount: u64,
    pub intentionality_factor: u8,
}

#[event]
pub struct RewardParametersUpdated {
    #[index]
    pub authority: Pubkey,
    pub new_parameters: RewardParameters,
}

#[event]
pub struct StakeUnlocked {
    #[index]
    pub staker: Pubkey,
    pub data_hash: [u8; 32],
    pub stake_amount: u64,
    pub unlock_time: i64,
}
