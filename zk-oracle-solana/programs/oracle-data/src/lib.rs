use anchor_lang::prelude::*;

declare_id!("OracleDataProgram11111111111111111111111111111");

#[program]
pub mod oracle_data_program {
    use super::*;

    /// Submit new information with ZK proof
    pub fn submit_information(
        ctx: Context<SubmitInformation>,
        data_hash: [u8; 32],
        metadata: Vec<u8>,
        category: u8,
        zk_proof_verification_id: Pubkey,
        min_trust_score: u32,
        stake_amount: u64,
    ) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;
        let submitter = &ctx.accounts.submitter;
        let clock = Clock::get()?;
        
        // Initialize data account
        data_account.data_hash = data_hash;
        data_account.submitter = submitter.key();
        data_account.category = category;
        data_account.timestamp = clock.unix_timestamp;
        data_account.metadata = metadata;
        data_account.trust_score = ctx.accounts.trust_score_account.base_score;
        data_account.validation_status = ValidationStatus::Pending as u8;
        data_account.stake_amount = stake_amount;
        data_account.zk_proof_verification_id = zk_proof_verification_id;
        data_account.min_trust_score = min_trust_score;
        data_account.validators = Vec::new();
        data_account.validation_count = 0;
        data_account.positive_validations = 0;
        
        // If stake is provided, transfer tokens to the stake account
        if stake_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.stake_from.to_account_info(),
                to: ctx.accounts.stake_account.to_account_info(),
                authority: submitter.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            
            // Transfer tokens to stake account
            transfer(cpi_ctx, stake_amount)?;
        }
        
        emit!(InformationSubmitted {
            data_hash,
            submitter: submitter.key(),
            category,
            timestamp: clock.unix_timestamp,
            trust_score: data_account.trust_score,
            stake_amount,
        });
        
        Ok(())
    }
    
    /// Validate submitted information
    pub fn validate_information(
        ctx: Context<ValidateInformation>,
        validation_result: bool,
        validation_proof: Vec<u8>,
    ) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;
        let validator = &ctx.accounts.validator;
        
        // Ensure validator hasn't already validated this data
        require!(
            !data_account.validators.contains(&validator.key()),
            OracleDataError::AlreadyValidated
        );
        
        // Add validator to list and increment validation count
        data_account.validators.push(validator.key());
        data_account.validation_count = data_account.validation_count.checked_add(1)
            .ok_or(OracleDataError::ArithmeticOverflow)?;
        
        // Update positive validations count if result is positive
        if validation_result {
            data_account.positive_validations = data_account.positive_validations.checked_add(1)
                .ok_or(OracleDataError::ArithmeticOverflow)?;
        }
        
        // Update validation status if we have enough validations
        if data_account.validation_count >= 3 {
            // Calculate consensus threshold (66%)
            let threshold = (data_account.validation_count * 66) / 100;
            
            if data_account.positive_validations >= threshold {
                data_account.validation_status = ValidationStatus::Validated as u8;
            } else {
                data_account.validation_status = ValidationStatus::Rejected as u8;
            }
            
            // If validated, update the trust score of the submitter (CPI call would go here)
            // If rejected and stake exists, process slashing (CPI call would go here)
        }
        
        emit!(InformationValidated {
            data_hash: data_account.data_hash,
            validator: validator.key(),
            validation_result,
            validation_count: data_account.validation_count,
            positive_validations: data_account.positive_validations,
            validation_status: data_account.validation_status,
        });
        
        Ok(())
    }
    
    /// Finalize validation and distribute rewards/penalties
    pub fn finalize_validation(
        ctx: Context<FinalizeValidation>,
    ) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;
        
        // Ensure validation is complete
        require!(
            data_account.validation_status != ValidationStatus::Pending as u8,
            OracleDataError::ValidationNotComplete
        );
        
        // If validation was successful, release stake and distribute rewards
        if data_account.validation_status == ValidationStatus::Validated as u8 {
            // Return stake to submitter (simplified, would be more complex in real implementation)
            if data_account.stake_amount > 0 {
                let cpi_accounts = Transfer {
                    from: ctx.accounts.stake_account.to_account_info(),
                    to: ctx.accounts.submitter_token_account.to_account_info(),
                    authority: ctx.accounts.stake_authority.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
                
                // Transfer tokens back to submitter
                transfer(cpi_ctx, data_account.stake_amount)?;
            }
            
            // Would also calculate and distribute rewards to validators here
        } 
        // If validation failed, apply slashing
        else if data_account.validation_status == ValidationStatus::Rejected as u8 {
            if data_account.stake_amount > 0 {
                // Calculate slash amount (simplified)
                let slash_amount = data_account.stake_amount / 2;
                let return_amount = data_account.stake_amount - slash_amount;
                
                // Return partial stake to submitter
                let cpi_accounts = Transfer {
                    from: ctx.accounts.stake_account.to_account_info(),
                    to: ctx.accounts.submitter_token_account.to_account_info(),
                    authority: ctx.accounts.stake_authority.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
                
                // Transfer tokens back to submitter
                transfer(cpi_ctx, return_amount)?;
                
                // Transfer slashed amount to treasury
                let cpi_accounts = Transfer {
                    from: ctx.accounts.stake_account.to_account_info(),
                    to: ctx.accounts.treasury_account.to_account_info(),
                    authority: ctx.accounts.stake_authority.to_account_info(),
                };
                let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
                
                // Transfer slashed tokens to treasury
                transfer(cpi_ctx, slash_amount)?;
            }
        }
        
        emit!(ValidationFinalized {
            data_hash: data_account.data_hash,
            validation_status: data_account.validation_status,
            submitter: data_account.submitter,
            stake_amount: data_account.stake_amount,
        });
        
        Ok(())
    }
    
    /// Query information with trust score requirement
    pub fn query_information(
        ctx: Context<QueryInformation>,
        min_trust_score: u32,
    ) -> Result<()> {
        let data_account = &ctx.accounts.data_account;
        
        // Ensure data has been validated
        require!(
            data_account.validation_status == ValidationStatus::Validated as u8,
            OracleDataError::DataNotValidated
        );
        
        // Ensure data meets minimum trust score requirement
        require!(
            data_account.trust_score >= min_trust_score,
            OracleDataError::InsufficientTrustScore
        );
        
        // Log the data query (actual data would be returned via program return in a real implementation)
        emit!(InformationQueried {
            querier: ctx.accounts.querier.key(),
            data_hash: data_account.data_hash,
            category: data_account.category,
            trust_score: data_account.trust_score,
        });
        
        Ok(())
    }
    
    /// Challenge validated information
    pub fn challenge_information(
        ctx: Context<ChallengeInformation>,
        evidence_hash: [u8; 32],
        challenge_stake: u64,
    ) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;
        let challenger = &ctx.accounts.challenger;
        
        // Ensure data has been validated
        require!(
            data_account.validation_status == ValidationStatus::Validated as u8,
            OracleDataError::DataNotValidated
        );
        
        // Ensure challenger is staking enough
        require!(
            challenge_stake >= data_account.stake_amount,
            OracleDataError::InsufficientChallengeStake
        );
        
        // Create challenge and lock challenger's stake
        let cpi_accounts = Transfer {
            from: ctx.accounts.challenger_token_account.to_account_info(),
            to: ctx.accounts.challenge_stake_account.to_account_info(),
            authority: challenger.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Transfer tokens to challenge stake account
        transfer(cpi_ctx, challenge_stake)?;
        
        // Mark data as challenged
        data_account.validation_status = ValidationStatus::Challenged as u8;
        
        emit!(InformationChallenged {
            data_hash: data_account.data_hash,
            challenger: challenger.key(),
            evidence_hash,
            challenge_stake,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(data_hash: [u8; 32], metadata: Vec<u8>, category: u8, 
    zk_proof_verification_id: Pubkey, min_trust_score: u32, stake_amount: u64)]
pub struct SubmitInformation<'info> {
    /// New account for storing oracle data
    #[account(
        init,
        payer = submitter,
        space = 8 + DataAccount::INIT_SPACE,
        seeds = [b"oracle_data", data_hash.as_ref(), submitter.key().as_ref()],
        bump
    )]
    pub data_account: Account<'info, DataAccount>,
    
    /// Trust score account of the submitter
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    /// Submitter of the information
    #[account(mut)]
    pub submitter: Signer<'info>,
    
    /// Token account to transfer stake from (only needed if stake_amount > 0)
    #[account(mut)]
    pub stake_from: Option<Account<'info, TokenAccount>>,
    
    /// Stake account to hold tokens during validation
    #[account(mut)]
    pub stake_account: Option<Account<'info, TokenAccount>>,
    
    /// Token program for stake transfers
    pub token_program: Option<Program<'info, Token>>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidateInformation<'info> {
    /// Oracle data account to validate
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    
    /// Trust score account of the validator
    pub validator_trust_score: Account<'info, TrustScoreAccount>,
    
    /// Validator
    pub validator: Signer<'info>,
    
    /// ZK verification account reference
    /// This would link to a verification account in the ZK verification program
    pub zk_verification_account: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct FinalizeValidation<'info> {
    /// Oracle data account
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    
    /// Authority for stake account (program or multisig)
    pub stake_authority: AccountInfo<'info>,
    
    /// Submitter's token account to return stake
    #[account(mut)]
    pub submitter_token_account: Account<'info, TokenAccount>,
    
    /// Stake account holding the locked tokens
    #[account(mut)]
    pub stake_account: Account<'info, TokenAccount>,
    
    /// Treasury account for slashed tokens
    #[account(mut)]
    pub treasury_account: Account<'info, TokenAccount>,
    
    /// Token program for transfers
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct QueryInformation<'info> {
    /// Oracle data account to query
    pub data_account: Account<'info, DataAccount>,
    
    /// Entity querying the information
    pub querier: Signer<'info>,
}

#[derive(Accounts)]
pub struct ChallengeInformation<'info> {
    /// Oracle data account to challenge
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    
    /// Challenger
    pub challenger: Signer<'info>,
    
    /// Challenger's token account for stake
    #[account(mut)]
    pub challenger_token_account: Account<'info, TokenAccount>,
    
    /// Account to hold challenge stake
    #[account(mut)]
    pub challenge_stake_account: Account<'info, TokenAccount>,
    
    /// Token program for stake transfers
    pub token_program: Program<'info, Token>,
}

/// External account structures from other programs
#[account]
pub struct TrustScoreAccount {
    pub authority: Pubkey,
    pub base_score: u32,
    // Other fields not used in this program
}

#[account]
pub struct TokenAccount {
    // Simplified for demonstration
    // In a real implementation, this would be a proper SPL token account
}

/// External program interfaces
pub struct Token; // Represents the SPL Token program

/// Oracle data account structure
#[account]
pub struct DataAccount {
    pub data_hash: [u8; 32],
    pub submitter: Pubkey,
    pub category: u8,
    pub timestamp: i64,
    pub metadata: Vec<u8>, // Additional metadata about the data
    pub trust_score: u32,  // Trust score at submission time
    pub validation_status: u8,
    pub stake_amount: u64,
    pub zk_proof_verification_id: Pubkey, // Reference to ZK verification
    pub min_trust_score: u32, // Minimum trust score required to access
    pub validators: Vec<Pubkey>,
    pub validation_count: u64,
    pub positive_validations: u64,
}

impl DataAccount {
    pub const INIT_SPACE: usize = 32 + // data_hash
                                 32 + // submitter
                                 1 + // category
                                 8 + // timestamp
                                 4 + 256 + // metadata (assuming max 256 bytes)
                                 4 + // trust_score
                                 1 + // validation_status
                                 8 + // stake_amount
                                 32 + // zk_proof_verification_id
                                 4 + // min_trust_score
                                 4 + (10 * 32) + // validators (vector with capacity for 10 validators)
                                 8 + // validation_count
                                 8; // positive_validations
}

/// Validation status enum
#[repr(u8)]
pub enum ValidationStatus {
    Pending = 0,
    Validated = 1,
    Rejected = 2,
    Challenged = 3,
}

/// CPI function to transfer tokens
/// In a real implementation, this would use the actual SPL token program
fn transfer<'a, 'b, 'c, 'info>(
    ctx: CpiContext<'a, 'b, 'c, 'info, Transfer<'info>>,
    amount: u64,
) -> Result<()> {
    // This is a placeholder for the actual token transfer logic
    // In a real implementation, this would call token::transfer
    Ok(())
}

/// CPI accounts for token transfer
pub struct Transfer<'info> {
    pub from: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}

#[error_code]
pub enum OracleDataError {
    #[msg("Validator has already validated this data")]
    AlreadyValidated,
    
    #[msg("Arithmetic overflow occurred during calculation")]
    ArithmeticOverflow,
    
    #[msg("Validation process is not yet complete")]
    ValidationNotComplete,
    
    #[msg("Data has not been validated")]
    DataNotValidated,
    
    #[msg("Data does not meet minimum trust score requirement")]
    InsufficientTrustScore,
    
    #[msg("Challenge stake must be at least equal to the original stake")]
    InsufficientChallengeStake,
}

// Events
#[event]
pub struct InformationSubmitted {
    #[index]
    pub data_hash: [u8; 32],
    pub submitter: Pubkey,
    pub category: u8,
    pub timestamp: i64,
    pub trust_score: u32,
    pub stake_amount: u64,
}

#[event]
pub struct InformationValidated {
    #[index]
    pub data_hash: [u8; 32],
    pub validator: Pubkey,
    pub validation_result: bool,
    pub validation_count: u64,
    pub positive_validations: u64,
    pub validation_status: u8,
}

#[event]
pub struct ValidationFinalized {
    #[index]
    pub data_hash: [u8; 32],
    pub validation_status: u8,
    pub submitter: Pubkey,
    pub stake_amount: u64,
}

#[event]
pub struct InformationQueried {
    pub querier: Pubkey,
    #[index]
    pub data_hash: [u8; 32],
    pub category: u8,
    pub trust_score: u32,
}

#[event]
pub struct InformationChallenged {
    #[index]
    pub data_hash: [u8; 32],
    pub challenger: Pubkey,
    pub evidence_hash: [u8; 32],
    pub challenge_stake: u64,
}
