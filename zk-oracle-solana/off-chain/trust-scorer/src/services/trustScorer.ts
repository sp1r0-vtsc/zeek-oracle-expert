/**
 * Trust Scoring Service
 * Calculates trust scores for information providers in the Oracle System
 */

import { Logger } from 'winston';
import * as math from 'mathjs';

// Define interfaces
export interface AccuracyHistory {
  timestamp: number;
  score: number;
}

export interface TrustScoreParams {
  baseScore?: number;
  accuracyHistory?: AccuracyHistory[];
  consistencyFactor?: number;
  validationSuccessRate?: number;
  domainExpertise?: Map<string, number>;
  totalSubmissions?: number;
}

export interface TrustScoreWeights {
  accuracy: number;
  consistency: number;
  validation: number;
}

export class TrustScorer {
  private logger: Logger;
  
  // Default weights
  private readonly defaultWeights: TrustScoreWeights = {
    accuracy: 0.6,
    consistency: 0.2,
    validation: 0.2
  };
  
  // Decay parameter for historical data (higher = faster decay)
  private readonly decayRate: number = 0.05;
  
  constructor(logger: Logger) {
    this.logger = logger;
    this.logger.info('Initializing Trust Scorer Service');
  }
  
  /**
   * Calculate a trust score based on historical performance with time decay
   * @param params Trust score parameters
   * @param weights Optional weights for different factors
   * @returns Calculated trust score (0-1000)
   */
  public calculateTrustScore(
    params: TrustScoreParams,
    weights: Partial<TrustScoreWeights> = {}
  ): number {
    this.logger.debug('Calculating trust score', { 
      baseScore: params.baseScore,
      historyCount: params.accuracyHistory?.length,
      consistencyFactor: params.consistencyFactor,
      validationSuccessRate: params.validationSuccessRate
    });
    
    // Set default values for any missing parameters
    const baseScore = params.baseScore ?? 500;
    const accuracyHistory = params.accuracyHistory ?? [];
    const consistencyFactor = params.consistencyFactor ?? 500;
    const validationSuccessRate = params.validationSuccessRate ?? 500;
    
    // Apply weights, ensuring they sum to 1.0
    const finalWeights = this.normalizeWeights({
      accuracy: weights.accuracy ?? this.defaultWeights.accuracy,
      consistency: weights.consistency ?? this.defaultWeights.consistency,
      validation: weights.validation ?? this.defaultWeights.validation
    });
    
    // Calculate accuracy factor with time decay
    const accuracyFactor = this.calculateDecayedAccuracy(accuracyHistory);
    
    // Apply weights to each factor
    const weightedAccuracy = Math.round(accuracyFactor * finalWeights.accuracy);
    const weightedConsistency = Math.round(consistencyFactor * finalWeights.consistency);
    const weightedValidation = Math.round(validationSuccessRate * finalWeights.validation);
    
    // Calculate final score (ensuring it stays within 0-1000 range)
    const score = Math.min(1000, Math.max(0, weightedAccuracy + weightedConsistency + weightedValidation));
    
    this.logger.debug('Trust score calculated', { 
      score,
      weightedAccuracy,
      weightedConsistency, 
      weightedValidation,
      weights: finalWeights
    });
    
    return score;
  }
  
  /**
   * Apply Bayesian update to a trust score based on new evidence
   * @param currentScore Current trust score (0-1000)
   * @param newEvidence Score of new evidence (0-1000)
   * @param evidenceWeight Weight of new evidence (0-1)
   * @returns Updated trust score
   */
  public updateTrustScore(
    currentScore: number,
    newEvidence: number,
    evidenceWeight: number = 0.1
  ): number {
    // Simple Bayesian update with configurable weight
    const normalizedWeight = Math.max(0, Math.min(1, evidenceWeight));
    const updatedScore = Math.round(
      currentScore * (1 - normalizedWeight) + newEvidence * normalizedWeight
    );
    
    // Ensure score stays within bounds
    return Math.min(1000, Math.max(0, updatedScore));
  }
  
  /**
   * Calculate time-decayed accuracy score from history
   * @param history Array of historical accuracy records with timestamps
   * @returns Decayed accuracy factor (0-1000)
   */
  private calculateDecayedAccuracy(history: AccuracyHistory[]): number {
    if (history.length === 0) {
      return 500; // Default middle score if no history
    }
    
    const now = Date.now();
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const entry of history) {
      // Calculate age in days
      const ageInDays = (now - entry.timestamp) / (24 * 60 * 60 * 1000);
      
      // Apply exponential decay: weight = e^(-decayRate * ageInDays)
      const weight = Math.exp(-this.decayRate * ageInDays);
      
      weightedSum += entry.score * weight;
      totalWeight += weight;
    }
    
    // Return weighted average, defaulting to 500 if no weight
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 500;
  }
  
  /**
   * Update consistency factor based on temporal stability
   * @param currentFactor Current consistency factor
   * @param newSubmission Latest submission score
   * @param previousSubmission Previous submission score
   * @returns Updated consistency factor
   */
  public updateConsistencyFactor(
    currentFactor: number,
    newSubmission: number,
    previousSubmission: number
  ): number {
    // Calculate deviation between submissions (normalized to 0-1)
    const deviation = Math.abs(newSubmission - previousSubmission) / 1000;
    
    // Calculate consistency change (higher deviation = lower consistency)
    // We use a sigmoid function to make small deviations have minimal impact
    // and large deviations have significant impact
    const sigmoid = 1 / (1 + Math.exp(-10 * (deviation - 0.5)));
    const consistencyDelta = Math.round((0.5 - sigmoid) * 200); // Scale to meaningful change
    
    // Apply delta with bounds checking
    const updatedFactor = Math.min(1000, Math.max(0, currentFactor + consistencyDelta));
    
    this.logger.debug('Updated consistency factor', {
      currentFactor,
      updatedFactor,
      deviation,
      consistencyDelta
    });
    
    return updatedFactor;
  }
  
  /**
   * Update validation success rate based on validation outcome
   * @param currentRate Current validation success rate
   * @param isValidated Whether the submission was validated
   * @returns Updated validation success rate
   */
  public updateValidationRate(
    currentRate: number,
    isValidated: boolean
  ): number {
    // Increase or decrease based on validation outcome
    // We apply a larger penalty for failures than reward for success
    const delta = isValidated ? 10 : -20;
    
    // Apply change with bounds checking
    const updatedRate = Math.min(1000, Math.max(0, currentRate + delta));
    
    this.logger.debug('Updated validation rate', {
      currentRate,
      updatedRate,
      isValidated,
      delta
    });
    
    return updatedRate;
  }
  
  /**
   * Predict trust score trend based on historical data
   * @param history Array of historical trust scores with timestamps
   * @param daysToPredict Number of days to predict into the future
   * @returns Predicted trust score
   */
  public predictTrustScoreTrend(
    history: AccuracyHistory[],
    daysToPredict: number = 30
  ): number {
    if (history.length < 3) {
      // Need at least 3 data points for meaningful prediction
      return history.length > 0 ? history[history.length - 1].score : 500;
    }
    
    try {
      // Prepare data for regression
      const x = history.map(h => h.timestamp);
      const y = history.map(h => h.score);
      
      // Perform linear regression
      const regression = this.linearRegression(x, y);
      
      // Predict future score
      const futureTimestamp = Date.now() + (daysToPredict * 24 * 60 * 60 * 1000);
      const predictedScore = regression.slope * futureTimestamp + regression.intercept;
      
      // Ensure prediction stays within bounds
      return Math.min(1000, Math.max(0, Math.round(predictedScore)));
    } catch (error) {
      this.logger.error('Error predicting trust score trend', { error });
      return history[history.length - 1].score; // Return latest score if prediction fails
    }
  }
  
  /**
   * Normalize weights to ensure they sum to 1.0
   * @param weights Weights to normalize
   * @returns Normalized weights
   */
  private normalizeWeights(weights: TrustScoreWeights): TrustScoreWeights {
    const total = weights.accuracy + weights.consistency + weights.validation;
    
    return {
      accuracy: weights.accuracy / total,
      consistency: weights.consistency / total,
      validation: weights.validation / total
    };
  }
  
  /**
   * Perform linear regression on a set of points
   * @param x X values (independent variable)
   * @param y Y values (dependent variable)
   * @returns Regression results (slope and intercept)
   */
  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    // Calculate slope
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < x.length; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    // Calculate intercept
    const intercept = meanY - (slope * meanX);
    
    return { slope, intercept };
  }
}
