/**
 * API Routes for ZK Proof Service
 */

import { Router, Request, Response, Application } from 'express';
import { Logger } from 'winston';
import { ZKProofService, CircuitType, ProofSystem } from '../services/zkProofService';

export function configureRoutes(app: Application, zkProofService: ZKProofService, logger: Logger): void {
  const router = Router();

  /**
   * Health check endpoint
   */
  router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  /**
   * Generate validity proof
   */
  router.post('/proofs/validity', async (req: Request, res: Response) => {
    try {
      const { data, privateInputs } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Missing required parameter: data' });
      }
      
      logger.info('Generating validity proof', { dataSize: Buffer.from(data).length });
      
      const result = await zkProofService.generateValidityProof(
        Buffer.from(data),
        privateInputs || {}
      );
      
      return res.status(200).json({
        proof: result.proof.toString('base64'),
        publicInputs: result.publicInputs.toString('base64'),
        circuitType: CircuitType.DATA_VALIDITY,
        proofSystem: ProofSystem.GROTH16
      });
    } catch (error) {
      logger.error('Error in validity proof endpoint', { error });
      return res.status(500).json({ error: `Failed to generate validity proof: ${error}` });
    }
  });

  /**
   * Generate credential proof
   */
  router.post('/proofs/credential', async (req: Request, res: Response) => {
    try {
      const { credentials, minRequirements } = req.body;
      
      if (!credentials) {
        return res.status(400).json({ error: 'Missing required parameter: credentials' });
      }
      
      logger.info('Generating credential proof', { 
        domain: credentials.domain,
        requirements: minRequirements
      });
      
      const result = await zkProofService.generateCredentialProof(
        credentials,
        minRequirements || {}
      );
      
      return res.status(200).json({
        proof: result.proof.toString('base64'),
        publicInputs: result.publicInputs.toString('base64'),
        circuitType: CircuitType.IDENTITY,
        proofSystem: ProofSystem.GROTH16
      });
    } catch (error) {
      logger.error('Error in credential proof endpoint', { error });
      return res.status(500).json({ error: `Failed to generate credential proof: ${error}` });
    }
  });

  /**
   * Generate validation proof
   */
  router.post('/proofs/validation', async (req: Request, res: Response) => {
    try {
      const { validationData, validationResult } = req.body;
      
      if (!validationData || validationResult === undefined) {
        return res.status(400).json({ 
          error: 'Missing required parameters: validationData and validationResult' 
        });
      }
      
      logger.info('Generating validation proof', { result: validationResult });
      
      const result = await zkProofService.generateValidationProof(
        validationData,
        validationResult
      );
      
      return res.status(200).json({
        proof: result.proof.toString('base64'),
        publicInputs: result.publicInputs.toString('base64'),
        circuitType: CircuitType.VALIDATION,
        proofSystem: ProofSystem.PLONK
      });
    } catch (error) {
      logger.error('Error in validation proof endpoint', { error });
      return res.status(500).json({ error: `Failed to generate validation proof: ${error}` });
    }
  });

  /**
   * Verify proof (for testing and development)
   */
  router.post('/proofs/verify', async (req: Request, res: Response) => {
    try {
      const { proof, publicInputs, circuitType, proofSystem } = req.body;
      
      if (!proof || !publicInputs || !circuitType || !proofSystem) {
        return res.status(400).json({ 
          error: 'Missing required parameters: proof, publicInputs, circuitType, proofSystem' 
        });
      }
      
      logger.info('Verifying proof', { circuitType, proofSystem });
      
      const isValid = await zkProofService.verifyProof(
        proofSystem,
        Buffer.from(proof, 'base64'),
        Buffer.from(publicInputs, 'base64'),
        circuitType
      );
      
      return res.status(200).json({
        isValid,
        circuitType,
        proofSystem
      });
    } catch (error) {
      logger.error('Error in verify proof endpoint', { error });
      return res.status(500).json({ error: `Failed to verify proof: ${error}` });
    }
  });

  // Register routes
  app.use('/api/v1', router);
  
  // Error handling middleware
  // Error handling middleware (note: use underscores for unused parameters)
  app.use((err: any, _req: Request, res: Response, _next: any) => {
    logger.error('Unhandled error', { error: err });
    res.status(500).json({ error: 'Internal server error' });
  });
  
  logger.info('API routes configured');
}
