import axios from 'axios';

// Create API clients for each backend service
const zkProofService = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const trustScorerService = axios.create({
  baseURL: 'http://localhost:3100/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const crossValidatorService = axios.create({
  baseURL: 'http://localhost:3200/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ZK Proof Service APIs
export const zkProofAPI = {
  generateValidityProof: (data: any) => 
    zkProofService.post('/proofs/validity', data),
  
  generateCredentialProof: (data: any) => 
    zkProofService.post('/proofs/credential', data),
  
  generateValidationProof: (data: any) => 
    zkProofService.post('/proofs/validation', data),
  
  verifyProof: (proof: any) => 
    zkProofService.post('/proofs/verify', proof),
};

// Trust Scorer APIs
export const trustScorerAPI = {
  calculateTrustScore: (data: any) => 
    trustScorerService.post('/trust-score/calculate', data),
  
  updateTrustScore: (data: any) => 
    trustScorerService.post('/trust-score/update', data),
  
  updateConsistency: (data: any) => 
    trustScorerService.post('/trust-score/consistency', data),
  
  updateValidationRate: (data: any) => 
    trustScorerService.post('/trust-score/validation-rate', data),
  
  predictTrustTrend: (data: any) => 
    trustScorerService.post('/trust-score/predict-trend', data),
};

// Cross Validator APIs
export const crossValidatorAPI = {
  aggregateValidations: (data: any) => 
    crossValidatorService.post('/validate/aggregate', data),
  
  requestValidations: (data: any) => 
    crossValidatorService.post('/validate/request', data),
  
  detectCollusion: (data: any) => 
    crossValidatorService.post('/validate/detect-collusion', data),
  
  generateConsensusProof: (data: any) => 
    crossValidatorService.post('/validate/generate-proof', data),
};

// Error handler middleware
zkProofService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('ZK Proof Service Error:', error);
    return Promise.reject(error);
  }
);

trustScorerService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Trust Scorer Service Error:', error);
    return Promise.reject(error);
  }
);

crossValidatorService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Cross Validator Service Error:', error);
    return Promise.reject(error);
  }
);

export default {
  zkProofAPI,
  trustScorerAPI,
  crossValidatorAPI,
};
