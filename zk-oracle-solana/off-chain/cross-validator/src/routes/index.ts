/**
 * API Routes for Cross-Validator Service
 */

import { Router, Request, Response, Application } from 'express';
import { Logger } from 'winston';
import { 
  CrossValidator, 
  ValidationRequest, 
  Validation, 
  ValidationResult, 
  ConsensusConfig 
} from '../services/crossValidator';

export function configureRoutes(app: Application, crossValidator: CrossValidator, logger: Logger): void {
  const router = Router();

  /**
   * Health check endpoint
   */
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  /**
   * Aggregate validations endpoint
   */
  router.post('/aggregate', async (req: Request, res: Response) => {
    try {
      const { dataId, validations, config } = req.body;
      
      if (!dataId || !validations || !Array.isArray(validations)) {
        return res.status(400).json({ 
          error: 'Missing required parameters: dataId and validations (array)'
        });
      }
      
      logger.info('Aggregating validations', { 
        dataId,
        validationCount: validations.length
      });
      
      // Aggregate validations
      const result = await crossValidator.aggregateValidations(
        dataId,
        validations,
        config
      );
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error aggregating validations', { error });
      res.status(500).json({ error: `Failed to aggregate validations: ${error}` });
    }
  });

  /**
   * Request validations endpoint
   */
  router.post('/request', async (req: Request, res: Response) => {
    try {
      const request: ValidationRequest = req.body;
      
      const requiredFields = ['dataId', 'dataHash', 'category', 'validators'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required parameters: ${missingFields.join(', ')}`
        });
      }
      
      logger.info('Requesting validations', { 
        dataId: request.dataId,
        validatorCount: request.validators.length
      });
      
      // Request validations
      const result = await crossValidator.requestValidations(
        request,
        req.body.config
      );
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error requesting validations', { error });
      res.status(500).json({ error: `Failed to request validations: ${error}` });
    }
  });

  /**
   * Detect validator collusion endpoint
   */
  router.post('/detect-collusion', (req: Request, res: Response) => {
    try {
      const { validations, validatorIds } = req.body;
      
      if (!validations || !Array.isArray(validations) || 
          !validatorIds || !Array.isArray(validatorIds)) {
        return res.status(400).json({ 
          error: 'Missing required parameters: validations and validatorIds (both arrays)'
        });
      }
      
      logger.info('Detecting collusion', { 
        validationCount: validations.length,
        validatorCount: validatorIds.length
      });
      
      // Detect collusion
      const result = crossValidator.detectCollusion(
        validations,
        validatorIds
      );
      
      res.status(200).json({
        ...result,
        validationCount: validations.length,
        validatorCount: validatorIds.length
      });
    } catch (error) {
      logger.error('Error detecting collusion', { error });
      res.status(500).json({ error: `Failed to detect collusion: ${error}` });
    }
  });

  /**
   * Generate consensus proof endpoint
   */
  router.post('/generate-proof', (req: Request, res: Response) => {
    try {
      const result: ValidationResult = req.body;
      
      if (!result || !result.dataId || !result.validations) {
        return res.status(400).json({ 
          error: 'Missing required parameters: ValidationResult object with dataId and validations'
        });
      }
      
      logger.info('Generating consensus proof', { 
        dataId: result.dataId,
        isValid: result.isValid,
        validationCount: result.validations.length
      });
      
      // Generate consensus proof
      const proof = crossValidator.generateConsensusProof(result);
      
      res.status(200).json({
        dataId: result.dataId,
        isValid: result.isValid,
        consensusRatio: result.consensusRatio,
        proof: proof.toString('base64'),
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Error generating consensus proof', { error });
      res.status(500).json({ error: `Failed to generate consensus proof: ${error}` });
    }
  });

  /**
   * Simulated validation endpoint (for testing only)
   */
  router.post('/simulate', (req: Request, res: Response) => {
    try {
      const { validators, request } = req.body;
      
      if (!validators || !Array.isArray(validators) || !request) {
        return res.status(400).json({ 
          error: 'Missing required parameters: validators (array) and request'
        });
      }
      
      logger.info('Simulating validation', { 
        dataId: request.dataId,
        validatorCount: validators.length
      });
      
      // For each validator, generate a simulated validation
      const simulations: any[] = [];
      
      for (const validator of validators) {
        // @ts-ignore: Access to private method for testing purposes
        const simulation = crossValidator.simulateValidation(validator, request);
        simulations.push({
          validator,
          result: simulation.result,
          trustScore: simulation.trustScore
        });
      }
      
      res.status(200).json({
        simulations,
        dataId: request.dataId,
        dataHash: request.dataHash,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Error simulating validations', { error });
      res.status(500).json({ error: `Failed to simulate validations: ${error}` });
    }
  });

  // Register routes
  app.use('/api/v1/validate', router);
  
  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    logger.error('Unhandled error', { error: err });
    res.status(500).json({ error: 'Internal server error' });
  });
  
  logger.info('Cross-Validation API routes configured');
}
