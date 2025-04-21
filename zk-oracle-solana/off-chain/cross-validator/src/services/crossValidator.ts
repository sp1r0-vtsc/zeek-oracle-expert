/**
 * Cross-Validator Service
 * Aggregates validations from multiple sources for the Oracle System
 */

import { Logger } from 'winston';
import axios from 'axios';

// Define interfaces
export interface Validation {
  validator: string;
  result: boolean;
  trustScore: number;
  timestamp: number;
  evidence?: any;
}

export interface ValidationResult {
  dataId: string;
  isValid: boolean;
  weightedPositive: number;
  weightedNegative: number;
  consensusRatio: number;
  validations: Validation[];
  timestamp: number;
}

export interface ValidationRequest {
  dataId: string;
  dataHash: string;
  category: number;
  validators: string[];
  minValidations: number;
  consensusThreshold: number;
}

export interface ConsensusConfig {
  minValidations: number;
  consensusThreshold: number;
  timeoutMs: number;
}

export class CrossValidator {
  private logger: Logger;
  
  // Default configuration
  private readonly defaultConfig: ConsensusConfig = {
    minValidations: 3,
    consensusThreshold: 0.66, // 66% weighted majority
    timeoutMs: 30000 // 30 seconds
  };
  
  constructor(logger: Logger) {
    this.logger = logger;
    this.logger.info('Initializing Cross-Validator Service');
  }
  
  /**
   * Aggregate validations from multiple sources with trust score weighting
   * @param dataId Unique identifier for the data being validated
   * @param validations Array of validations from different validators
   * @param config Consensus configuration
   * @returns Validation result with consensus calculation
   */
  public async aggregateValidations(
    dataId: string,
    validations: Validation[],
    config: Partial<ConsensusConfig> = {}
  ): Promise<ValidationResult> {
    // Merge config with defaults
    const finalConfig = { ...this.defaultConfig, ...config };
    
    this.logger.debug('Aggregating validations', { 
      dataId, 
      validationCount: validations.length,
      config: finalConfig
    });
    
    // Check if we have enough validations
    if (validations.length < finalConfig.minValidations) {
      this.logger.warn('Insufficient validations', {
        dataId,
        received: validations.length,
        required: finalConfig.minValidations
      });
      
      return {
        dataId,
        isValid: false,
        weightedPositive: 0,
        weightedNegative: 0,
        consensusRatio: 0,
        validations,
        timestamp: Date.now()
      };
    }
    
    // Weight validations by trust scores
    let weightedPositive = 0;
    let weightedNegative = 0;
    
    for (const validation of validations) {
      if (validation.result) {
        weightedPositive += validation.trustScore;
      } else {
        weightedNegative += validation.trustScore;
      }
    }
    
    // Calculate consensus ratio
    const totalWeight = weightedPositive + weightedNegative;
    const consensusRatio = totalWeight > 0 ? weightedPositive / totalWeight : 0;
    
    // Determine consensus result
    const isValid = consensusRatio >= finalConfig.consensusThreshold;
    
    this.logger.info('Validation consensus result', {
      dataId,
      isValid,
      consensusRatio,
      validationCount: validations.length
    });
    
    return {
      dataId,
      isValid,
      weightedPositive,
      weightedNegative,
      consensusRatio,
      validations,
      timestamp: Date.now()
    };
  }
  
  /**
   * Request validations from a set of validators
   * @param request Validation request details
   * @param config Consensus configuration
   * @returns Validation result
   */
  public async requestValidations(
    request: ValidationRequest,
    config: Partial<ConsensusConfig> = {}
  ): Promise<ValidationResult> {
    // Merge config with defaults
    const finalConfig = { ...this.defaultConfig, ...config };
    
    this.logger.debug('Requesting validations', { 
      dataId: request.dataId, 
      validators: request.validators.length,
      config: finalConfig
    });
    
    try {
      // In a real implementation, this would make parallel requests to validators
      // Here, we simulate the process with random responses
      
      // Collect validations with timeout
      const validations: Validation[] = [];
      
      // Create an array of promises for validator responses
      const validationPromises = request.validators.map(async (validator) => {
        try {
          // In a real implementation, this would be an actual API call
          // const response = await axios.post(`${validator}/validate`, {
          //   dataId: request.dataId,
          //   dataHash: request.dataHash,
          //   category: request.category
          // });
          
          // For simulation, generate a random validation
          const simulatedValidation = this.simulateValidation(validator, request);
          
          validations.push(simulatedValidation);
          this.logger.debug('Received validation', { 
            validator, 
            result: simulatedValidation.result,
            trustScore: simulatedValidation.trustScore
          });
          
          return simulatedValidation;
        } catch (error) {
          this.logger.error('Error requesting validation', { validator, error });
          return null;
        }
      });
      
      // Wait for all validation requests to complete or timeout
      await Promise.race([
        Promise.all(validationPromises),
        new Promise(resolve => setTimeout(resolve, finalConfig.timeoutMs))
      ]);
      
      // Remove null entries (failed requests)
      const successfulValidations = validations.filter(v => v !== null);
      
      // Aggregate validations
      return this.aggregateValidations(request.dataId, successfulValidations, config);
    } catch (error) {
      this.logger.error('Error in validation process', { error });
      throw new Error(`Validation process failed: ${error}`);
    }
  }
  
  /**
   * Detect potential validator collusion based on validation patterns
   * @param validations Array of historical validations
   * @param validatorIds Array of validator IDs to check
   * @returns Whether collusion is detected and with what probability
   */
  public detectCollusion(
    validations: ValidationResult[],
    validatorIds: string[]
  ): { detected: boolean; probability: number; suspects: string[] } {
    if (validations.length < 5 || validatorIds.length < 2) {
      return { detected: false, probability: 0, suspects: [] };
    }
    
    // Extract validator behavior patterns
    const patterns: Record<string, boolean[]> = {};
    const validationCounts: Record<string, number> = {};
    
    // Initialize patterns for all validators
    for (const validatorId of validatorIds) {
      patterns[validatorId] = [];
      validationCounts[validatorId] = 0;
    }
    
    // Collect validation patterns
    for (const validation of validations) {
      for (const v of validation.validations) {
        if (validatorIds.includes(v.validator)) {
          patterns[v.validator].push(v.result);
          validationCounts[v.validator]++;
        }
      }
    }
    
    // Calculate correlation between validators
    const suspects: string[] = [];
    let maxCorrelation = 0;
    
    // Check each pair of validators
    for (let i = 0; i < validatorIds.length; i++) {
      for (let j = i + 1; j < validatorIds.length; j++) {
        const validatorA = validatorIds[i];
        const validatorB = validatorIds[j];
        
        // Need minimum number of common validations
        const minValidations = Math.min(
          validationCounts[validatorA], 
          validationCounts[validatorB]
        );
        
        if (minValidations < 5) continue;
        
        // Calculate correlation
        const correlation = this.calculateCorrelation(
          patterns[validatorA], 
          patterns[validatorB]
        );
        
        // If correlation exceeds threshold, add to suspects
        if (correlation > 0.9) { // 90% correlation is suspicious
          if (!suspects.includes(validatorA)) suspects.push(validatorA);
          if (!suspects.includes(validatorB)) suspects.push(validatorB);
          
          maxCorrelation = Math.max(maxCorrelation, correlation);
        }
      }
    }
    
    return {
      detected: suspects.length > 0,
      probability: maxCorrelation,
      suspects
    };
  }
  
  /**
   * Generate a consensus proof without revealing individual validations
   * This would normally use ZK proof generation
   * @param result Validation result
   * @returns Proof data (in a real implementation, this would be a ZK proof)
   */
  public generateConsensusProof(result: ValidationResult): Buffer {
    // In a real implementation, this would generate a ZK proof
    // that proves the consensus calculation was done correctly
    // without revealing the individual validators or their scores
    
    this.logger.debug('Generating consensus proof', { dataId: result.dataId });
    
    // For demonstration, we'll just create a JSON representation
    // In a real implementation, this would call a ZK proof generation library
    const proofData = {
      dataId: result.dataId,
      consensusRatio: result.consensusRatio,
      validationCount: result.validations.length,
      timestamp: result.timestamp,
      // Hash of validations rather than actual validations
      validationsHash: this.hashValidations(result.validations)
    };
    
    return Buffer.from(JSON.stringify(proofData));
  }
  
  /**
   * Calculate Pearson correlation coefficient between two boolean arrays
   * @param a First array
   * @param b Second array
   * @returns Correlation coefficient (-1 to 1)
   */
  private calculateCorrelation(a: boolean[], b: boolean[]): number {
    // Convert boolean arrays to numeric (0/1)
    const numA = a.map(val => val ? 1 : 0);
    const numB = b.map(val => val ? 1 : 0);
    
    // Calculate means
    const meanA = numA.reduce((sum, val) => sum + val, 0) / numA.length;
    const meanB = numB.reduce((sum, val) => sum + val, 0) / numB.length;
    
    // Calculate correlation components
    let numerator = 0;
    let denominatorA = 0;
    let denominatorB = 0;
    
    for (let i = 0; i < numA.length; i++) {
      const diffA = numA[i] - meanA;
      const diffB = numB[i] - meanB;
      
      numerator += diffA * diffB;
      denominatorA += diffA * diffA;
      denominatorB += diffB * diffB;
    }
    
    const denominator = Math.sqrt(denominatorA * denominatorB);
    
    return denominator > 0 ? numerator / denominator : 0;
  }
  
  /**
   * Create a hash of validations (for proof generation)
   * @param validations Array of validations
   * @returns Hash string
   */
  private hashValidations(validations: Validation[]): string {
    // In a real implementation, this would use a cryptographic hash function
    // For demonstration, we'll create a simple hash
    
    // Sort validations by validator ID for consistent hashing
    const sortedValidations = [...validations].sort((a, b) => 
      a.validator.localeCompare(b.validator)
    );
    
    // Create a string representation
    const validationString = sortedValidations.map(v => 
      `${v.validator}:${v.result}:${v.trustScore}`
    ).join('|');
    
    // Create simple hash (in real implementation, use crypto)
    let hash = 0;
    for (let i = 0; i < validationString.length; i++) {
      const char = validationString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  /**
   * Simulate a validation response (for testing purposes)
   * @param validator Validator ID
   * @param request Validation request
   * @returns Simulated validation
   */
  private simulateValidation(validator: string, request: ValidationRequest): Validation {
    // In a real implementation, this would be replaced with actual API calls
    
    // Generate pseudorandom result based on validator and data hash
    const seed = `${validator}:${request.dataHash}`;
    const pseudoRandom = this.hashString(seed);
    
    // Generate result - 80% true, 20% false (biased toward true for demo)
    const result = parseInt(pseudoRandom.substring(0, 8), 16) % 100 < 80;
    
    // Generate pseudorandom trust score between 200 and 1000
    const trustScore = 200 + (parseInt(pseudoRandom.substring(8, 16), 16) % 800);
    
    return {
      validator,
      result,
      trustScore,
      timestamp: Date.now(),
      evidence: {
        method: "simulated",
        confidence: 0.7 + (parseInt(pseudoRandom.substring(16, 18), 16) % 30) / 100
      }
    };
  }
  
  /**
   * Simple string hashing function for simulation
   * @param str String to hash
   * @returns Hash string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string and pad
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}
