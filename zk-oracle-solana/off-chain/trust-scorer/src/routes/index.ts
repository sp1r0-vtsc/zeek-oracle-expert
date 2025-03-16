/**
 * API Routes for Trust Scorer Service
 */

import { Router, Request, Response, Application } from 'express';
import { Logger } from 'winston';
import { TrustScorer, AccuracyHistory, TrustScoreParams } from '../services/trustScorer';

export function configureRoutes(app: Application, trustScorer: TrustScorer, logger: Logger): void {
  const router = Router();

  /**
   * Health check endpoint
   */
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  /**
   * Calculate trust score endpoint
   */
  router.post('/calculate', (req: Request, res: Response) => {
    try {
      const { 
        baseScore, 
        accuracyHistory, 
        consistencyFactor, 
        validationSuccessRate,
        domainExpertise,
        totalSubmissions,
        weights
      } = req.body;
      
      logger.info('Calculating trust score', { 
        baseScore, 
        historyLength: accuracyHistory?.length,
        consistencyFactor
      });
      
      // Prepare parameters
      const params: TrustScoreParams = {
        baseScore,
        accuracyHistory,
        consistencyFactor,
        validationSuccessRate,
        domainExpertise: domainExpertise ? new Map(Object.entries(domainExpertise)) : undefined,
        totalSubmissions
      };
      
      // Calculate trust score
      const score = trustScorer.calculateTrustScore(params, weights);
      
      res.status(200).json({
        score,
        params: {
          ...params,
          domainExpertise: params.domainExpertise ? Object.fromEntries(params.domainExpertise) : undefined
        },
        weights
      });
    } catch (error) {
      logger.error('Error calculating trust score', { error });
      res.status(500).json({ error: `Failed to calculate trust score: ${error}` });
    }
  });

  /**
   * Update trust score with new evidence
   */
  router.post('/update', (req: Request, res: Response) => {
    try {
      const { currentScore, newEvidence, evidenceWeight } = req.body;
      
      if (currentScore === undefined || newEvidence === undefined) {
        return res.status(400).json({ 
          error: 'Missing required parameters: currentScore and newEvidence'
        });
      }
      
      logger.info('Updating trust score', { currentScore, newEvidence, evidenceWeight });
      
      // Update trust score
      const updatedScore = trustScorer.updateTrustScore(
        currentScore,
        newEvidence,
        evidenceWeight
      );
      
      res.status(200).json({
        previousScore: currentScore,
        newEvidence,
        evidenceWeight: evidenceWeight || 0.1,
        updatedScore
      });
    } catch (error) {
      logger.error('Error updating trust score', { error });
      res.status(500).json({ error: `Failed to update trust score: ${error}` });
    }
  });

  /**
   * Update consistency factor
   */
  router.post('/consistency', (req: Request, res: Response) => {
    try {
      const { currentFactor, newSubmission, previousSubmission } = req.body;
      
      if (currentFactor === undefined || 
          newSubmission === undefined || 
          previousSubmission === undefined) {
        return res.status(400).json({ 
          error: 'Missing required parameters: currentFactor, newSubmission, previousSubmission'
        });
      }
      
      logger.info('Updating consistency factor', { 
        currentFactor, newSubmission, previousSubmission 
      });
      
      // Update consistency factor
      const updatedFactor = trustScorer.updateConsistencyFactor(
        currentFactor,
        newSubmission,
        previousSubmission
      );
      
      res.status(200).json({
        previousFactor: currentFactor,
        newSubmission,
        previousSubmission,
        updatedFactor
      });
    } catch (error) {
      logger.error('Error updating consistency factor', { error });
      res.status(500).json({ error: `Failed to update consistency factor: ${error}` });
    }
  });

  /**
   * Update validation success rate
   */
  router.post('/validation-rate', (req: Request, res: Response) => {
    try {
      const { currentRate, isValidated } = req.body;
      
      if (currentRate === undefined || isValidated === undefined) {
        return res.status(400).json({ 
          error: 'Missing required parameters: currentRate and isValidated'
        });
      }
      
      logger.info('Updating validation rate', { currentRate, isValidated });
      
      // Update validation rate
      const updatedRate = trustScorer.updateValidationRate(
        currentRate,
        isValidated
      );
      
      res.status(200).json({
        previousRate: currentRate,
        isValidated,
        updatedRate
      });
    } catch (error) {
      logger.error('Error updating validation rate', { error });
      res.status(500).json({ error: `Failed to update validation rate: ${error}` });
    }
  });

  /**
   * Predict trust score trend
   */
  router.post('/predict-trend', (req: Request, res: Response) => {
    try {
      const { history, daysToPredict } = req.body;
      
      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ 
          error: 'Missing or invalid required parameter: history (should be an array)'
        });
      }
      
      logger.info('Predicting trust score trend', { 
        historyPoints: history.length, 
        daysToPredict 
      });
      
      // Predict trust score trend
      const predictedScore = trustScorer.predictTrustScoreTrend(
        history,
        daysToPredict
      );
      
      res.status(200).json({
        historyPoints: history.length,
        daysToPredict: daysToPredict || 30,
        latestScore: history.length > 0 ? history[history.length - 1].score : null,
        predictedScore
      });
    } catch (error) {
      logger.error('Error predicting trust score trend', { error });
      res.status(500).json({ error: `Failed to predict trust score trend: ${error}` });
    }
  });

  // Register routes
  app.use('/api/v1/trust-score', router);
  
  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    logger.error('Unhandled error', { error: err });
    res.status(500).json({ error: 'Internal server error' });
  });
  
  logger.info('Trust Score API routes configured');
}
