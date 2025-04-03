import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Zero-Knowledge Oracle System on Solana
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A decentralized oracle system with privacy-preserving features, trust scoring, and incentivization mechanisms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-primary mb-3">Expert Interface</h2>
          <p className="text-gray-600 mb-4">
            Submit verified information with zero-knowledge proofs and earn rewards for valuable contributions.
          </p>
          <Link to="/expert" className="btn-primary inline-block">
            Go to Expert Interface
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-primary mb-3">Data Explorer</h2>
          <p className="text-gray-600 mb-4">
            Search and access oracle data with verified trust scores and validation proofs.
          </p>
          <Link to="/explorer" className="btn-primary inline-block">
            Explore Data
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-primary mb-3">Validation Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Participate in the cross-validation system to verify information and build trust.
          </p>
          <Link to="/validation" className="btn-primary inline-block">
            Validate Data
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-primary mb-3">Trust Score Monitor</h2>
          <p className="text-gray-600 mb-4">
            Track trust scores, historical performance, and reward distribution for participants.
          </p>
          <Link to="/trust-score" className="btn-primary inline-block">
            View Trust Scores
          </Link>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">Information Submission</h3>
              <p className="text-gray-600">Experts submit information with zero-knowledge proofs that validate their credentials without revealing identity.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">Cross Validation</h3>
              <p className="text-gray-600">Multiple validators verify the information, with their input weighted by trust scores for consensus.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">Trust Scoring</h3>
              <p className="text-gray-600">The system calculates time-decayed trust scores based on historical accuracy and consistency.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">4</div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">Incentivization</h3>
              <p className="text-gray-600">Token rewards are distributed to contributors and validators based on trust scores and value added.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
