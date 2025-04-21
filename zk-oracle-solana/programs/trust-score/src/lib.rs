use anchor_lang::prelude::*;
use std::collections::HashMap;

declare_id!("TruScoRELv578LhGMpGNcvp4CyuKkrckx3JZ1zPkp"); // Valid 32-byte ID

#[program]
pub mod trust_score_program {
    use super::*;

    /// Initialize a new trust score account for an expert/data provider
    pub fn initialize_trust_score(
        ctx: Context<InitializeTrustScore>,
        domain_expertise: Vec<(u8, u32)>,
    ) -> Result<()> {
        let trust_score_account = &mut ctx.accounts.trust_score_account;
        let authority = &ctx.accounts.authority;
        
        trust_score_account.authority = authority.key();
        trust_score_account.base_score = 500; // Start with a middle score of 500/1000
        trust_score_account.accuracy_history = Vec::new();
        trust_score_account.consistency_factor = 500; // Middle score
        trust_score_account.validation_success_rate = 500; // Middle score
        trust_score_account.total_submissions = 0;
        trust_score_account.domain_expertise = HashMap::new();
        
        // Set domain expertise if provided
        for (domain, level) in domain_expertise {
            trust_score_account.domain_expertise.insert(domain, level);
        }
        
        emit!(TrustScoreInitialized {
            authority: authority.key(),
            base_score: trust_score_account.base_score,
        });
        
        Ok(())
    }
    
    /// Record a submission by an information provider
    pub fn record_submission(
        ctx: Context<RecordSubmission>,
        data_hash: [u8; 32],
        category: u8,
    ) -> Result<()> {
        let trust_score_account = &mut ctx.accounts.trust_score_account;
        let authority = &ctx.accounts.authority;
        
        // Ensure the authority matches
        require!(
            trust_score_account.authority == authority.key(),
            TrustScoreError::InvalidAuthority
        );
        
        // Increment submission count
        trust_score_account.total_submissions = trust_score_account.total_submissions.checked_add(1)
            .ok_or(TrustScoreError::ArithmeticOverflow)?;
        
        emit!(SubmissionRecorded {
            authority: authority.key(),
            data_hash,
            category,
            total_submissions: trust_score_account.total_submissions,
        });
        
        Ok(())
    }
    
    /// Update the trust score based on validation results
    pub fn update_trust_score(
        ctx: Context<UpdateTrustScore>,
        accuracy_score: u32,
        is_validated: bool,
    ) -> Result<()> {
        let trust_score_account = &mut ctx.accounts.trust_score_account;
        let clock = Clock::get()?;
        
        // Add new accuracy score to history
        trust_score_account.accuracy_history.push((clock.unix_timestamp, accuracy_score));
        
        // Keep only the last 50 entries to prevent unbounded growth
        if trust_score_account.accuracy_history.len() > 50 {
            trust_score_account.accuracy_history.remove(0);
        }
        
        // Update validation success rate
        if is_validated {
            // Increase validation success rate
            trust_score_account.validation_success_rate = std::cmp::min(
                1000,
                trust_score_account.validation_success_rate.saturating_add(10)
            );
        } else {
            // Decrease validation success rate
            trust_score_account.validation_success_rate = trust_score_account.validation_success_rate.saturating_sub(20);
        }
        
        // Calculate new trust score
        let new_score = calculate_trust_score(trust_score_account);
        trust_score_account.base_score = new_score;
        
        emit!(TrustScoreUpdated {
            authority: trust_score_account.authority,
            new_score,
            accuracy_score,
            is_validated,
        });
        
        Ok(())
    }
    
    /// Update consistency factor based on temporal stability
    pub fn update_consistency_factor(
        ctx: Context<UpdateConsistencyFactor>,
        consistency_delta: i32,
    ) -> Result<()> {
        let trust_score_account = &mut ctx.accounts.trust_score_account;
        
        // Apply delta with bounds checking
        if consistency_delta >= 0 {
            trust_score_account.consistency_factor = std::cmp::min(
                1000, 
                trust_score_account.consistency_factor.saturating_add(consistency_delta as u32)
            );
        } else {
            trust_score_account.consistency_factor = trust_score_account.consistency_factor
                .saturating_sub(consistency_delta.abs() as u32);
        }
        
        // Calculate new trust score
        let new_score = calculate_trust_score(trust_score_account);
        trust_score_account.base_score = new_score;
        
        emit!(ConsistencyFactorUpdated {
            authority: trust_score_account.authority,
            new_consistency_factor: trust_score_account.consistency_factor,
            new_score,
        });
        
        Ok(())
    }
    
    /// Update domain expertise level
    pub fn update_domain_expertise(
        ctx: Context<UpdateDomainExpertise>,
        domain: u8,
        expertise_level: u32,
    ) -> Result<()> {
        let trust_score_account = &mut ctx.accounts.trust_score_account;
        
        // Ensure expertise level is within bounds (0-1000)
        require!(
            expertise_level <= 1000,
            TrustScoreError::InvalidExpertiseLevel
        );
        
        // Update domain expertise
        trust_score_account.domain_expertise.insert(domain, expertise_level);
        
        emit!(DomainExpertiseUpdated {
            authority: trust_score_account.authority,
            domain,
            expertise_level,
        });
        
        Ok(())
    }
}

/// Calculate trust score using weighted factors
fn calculate_trust_score(account: &TrustScoreAccount) -> u32 {
    // Get current time for decay calculation
    let current_time = Clock::get().unwrap().unix_timestamp;
    
    // Calculate weighted accuracy factor from history with time decay
    let mut total_weight = 0.0;
    let mut weighted_sum = 0.0;
    
    for (timestamp, score) in &account.accuracy_history {
        // Calculate age in days
        let age_days = (current_time - timestamp) as f64 / (24.0 * 60.0 * 60.0);
        
        // Apply exponential decay: weight = e^(-0.05 * age_days)
        let weight = (-0.05 * age_days).exp();
        
        weighted_sum += (*score as f64) * weight;
        total_weight += weight;
    }
    
    // Calculate decayed accuracy (default to 500 if no history)
    let accuracy_factor = if total_weight > 0.0 {
        (weighted_sum / total_weight) as u32
    } else {
        500
    };
    
    // Apply weights to each factor
    let weight_accuracy = 0.6;
    let weight_consistency = 0.2;
    let weight_validation = 0.2;
    
    // Calculate final score
    let weighted_accuracy = (accuracy_factor as f64 * weight_accuracy) as u32;
    let weighted_consistency = (account.consistency_factor as f64 * weight_consistency) as u32;
    let weighted_validation = (account.validation_success_rate as f64 * weight_validation) as u32;
    
    // Sum weighted factors
    weighted_accuracy.saturating_add(weighted_consistency).saturating_add(weighted_validation)
}

#[derive(Accounts)]
pub struct InitializeTrustScore<'info> {
    #[account(init, payer = authority, space = 8 + TrustScoreAccount::INIT_SPACE)]
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordSubmission<'info> {
    #[account(mut)]
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTrustScore<'info> {
    #[account(mut)]
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    /// Only authorized updaters can update scores
    #[account(constraint = updater.key() == trust_score_account.authority || updater_is_admin(&updater))]
    pub updater: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateConsistencyFactor<'info> {
    #[account(mut)]
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    /// Only authorized updaters can update consistency
    #[account(constraint = updater.key() == trust_score_account.authority || updater_is_admin(&updater))]
    pub updater: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateDomainExpertise<'info> {
    #[account(mut)]
    pub trust_score_account: Account<'info, TrustScoreAccount>,
    
    /// Only authorized updaters can update domain expertise
    #[account(constraint = updater.key() == trust_score_account.authority || updater_is_admin(&updater))]
    pub updater: Signer<'info>,
}

/// Function to check if an account is an admin
/// In a real implementation, this would check against a list of admin pubkeys or an admin program
fn updater_is_admin(updater: &Signer) -> bool {
    // For demonstration - would be replaced with actual admin checking logic
    false
}

#[account]
pub struct TrustScoreAccount {
    pub authority: Pubkey,
    pub base_score: u32,
    pub accuracy_history: Vec<(i64, u32)>, // (timestamp, score)
    pub consistency_factor: u32,
    pub validation_success_rate: u32,
    pub total_submissions: u64,
    pub domain_expertise: HashMap<u8, u32>, // category -> expertise level
}

impl TrustScoreAccount {
    pub const INIT_SPACE: usize = 32 + // authority
                                 4 + // base_score
                                 4 + (50 * (8 + 4)) + // accuracy_history (vector with capacity for 50 entries)
                                 4 + // consistency_factor
                                 4 + // validation_success_rate
                                 8 + // total_submissions
                                 4 + (20 * (1 + 4)); // domain_expertise (hashmap with capacity for 20 domains)
}

#[error_code]
pub enum TrustScoreError {
    #[msg("Authority does not match the trust score account's authority")]
    InvalidAuthority,
    
    #[msg("Arithmetic overflow occurred during calculation")]
    ArithmeticOverflow,
    
    #[msg("Expertise level must be between 0 and 1000")]
    InvalidExpertiseLevel,
}

// Events
#[event]
pub struct TrustScoreInitialized {
    #[index]
    pub authority: Pubkey,
    pub base_score: u32,
}

#[event]
pub struct SubmissionRecorded {
    #[index]
    pub authority: Pubkey,
    pub data_hash: [u8; 32],
    pub category: u8,
    pub total_submissions: u64,
}

#[event]
pub struct TrustScoreUpdated {
    #[index]
    pub authority: Pubkey,
    pub new_score: u32,
    pub accuracy_score: u32,
    pub is_validated: bool,
}

#[event]
pub struct ConsistencyFactorUpdated {
    #[index]
    pub authority: Pubkey,
    pub new_consistency_factor: u32,
    pub new_score: u32,
}

#[event]
pub struct DomainExpertiseUpdated {
    #[index]
    pub authority: Pubkey,
    pub domain: u8,
    pub expertise_level: u32,
}
