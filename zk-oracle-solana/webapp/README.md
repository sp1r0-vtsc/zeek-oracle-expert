# ZK Oracle System Web Application

This is the web application frontend for the Zero-Knowledge Oracle System on Solana. It provides interfaces for experts to submit information, users to access oracle data, validators to participate in the cross-validation system, and for tracking trust scores.

## Features

- **Expert Interface**: Submit verified information with zero-knowledge proofs
- **Data Explorer**: Search and access oracle data with trust scores
- **Validation Dashboard**: Participate in the cross-validation process
- **Trust Score Monitor**: Track trust scores and reward distribution

## Technology Stack

- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Solana Web3.js for blockchain interactions
- Solana Wallet Adapter for wallet connections
- Chart.js for data visualization

## Prerequisites

- Node.js (v16.0.0+)
- npm (v8.0.0+)
- Solana CLI tools (for running local validator during development)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the following content:
```
REACT_APP_ZK_PROOF_SERVICE_URL=http://localhost:3000/api/v1
REACT_APP_TRUST_SCORER_URL=http://localhost:3100/api/v1
REACT_APP_CROSS_VALIDATOR_URL=http://localhost:3200/api/v1
REACT_APP_SOLANA_NETWORK=devnet
```

## Running the Application

### Development Mode

```bash
npm start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

This will create an optimized production build in the `build` directory.

## Connecting to Backend Services

The web application connects to three backend services:

1. **ZK Proof Service** (port 3000): Generates and verifies zero-knowledge proofs
2. **Trust Scorer Service** (port 3100): Calculates and updates trust scores
3. **Cross Validator Service** (port 3200): Manages cross-validation and consensus

Make sure these services are running before using the web application features.

## Connecting to Solana

The application connects to the Solana blockchain to interact with the following programs:

- **Trust Scoring Program**: Manages reputation scores
- **Oracle Data Program**: Handles submission and retrieval of verified information
- **Incentivization Program**: Manages token rewards
- **ZK Verification Program**: Verifies zero-knowledge proofs on-chain

By default, the application connects to the Solana devnet. You can change this in the `.env` file.

## Development Notes

- Mock data is used in the application for demonstration purposes
- Wallet connection is required for most features
- The ZK proof functionality uses simulated proofs for now

## Future Enhancements

- Integration with actual ZK proof circuits
- Advanced visualization for trust score analytics
- Mobile-responsive design improvements
- Internationalization support
