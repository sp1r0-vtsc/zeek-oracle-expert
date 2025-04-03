import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const ExpertInterface: React.FC = () => {
  const { connected } = useWallet();
  const [submissionType, setSubmissionType] = useState<'data' | 'validation'>('data');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    domain: 'finance',
    confidence: 80,
    stakeAmount: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'confidence' || name === 'stakeAmount' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    // This would connect to the ZK Proof Service and Oracle Data Program
    alert('Information submitted! ZK proof generation would happen here.');
  };

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect Wallet to Continue</h2>
        <p className="text-gray-600 mb-6">
          You need to connect your Solana wallet to submit information as an expert.
        </p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-primary hover:!bg-primary-dark" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Expert Interface</h2>
        <p className="text-gray-600 mb-6">
          Submit verified information with zero-knowledge proofs and earn rewards based on
          validation and trust scores.
        </p>

        <div className="flex mb-6">
          <button
            className={`px-4 py-2 rounded-l-lg ${
              submissionType === 'data'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSubmissionType('data')}
          >
            Submit Information
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${
              submissionType === 'validation'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSubmissionType('validation')}
          >
            Validate Submissions
          </button>
        </div>

        {submissionType === 'data' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="input-field min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="domain">
                  Domain
                </label>
                <select
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="finance">Finance</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="science">Science</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="confidence">
                  Confidence (%)
                </label>
                <input
                  type="range"
                  id="confidence"
                  name="confidence"
                  min="1"
                  max="100"
                  value={formData.confidence}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <div className="text-center">{formData.confidence}%</div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="stakeAmount">
                  Stake Amount (SOL)
                </label>
                <input
                  type="number"
                  id="stakeAmount"
                  name="stakeAmount"
                  min="0.1"
                  step="0.1"
                  value={formData.stakeAmount}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <div className="text-sm text-gray-600">
                <div>Current Trust Score: <span className="font-semibold text-primary">87.5</span></div>
                <div>Reward Potential: <span className="font-semibold text-green-600">1.2-3.5 SOL</span></div>
              </div>
              <button type="submit" className="btn-primary">
                Submit with ZK Proof
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Validation Interface</h3>
            <p className="text-gray-600 mb-6">
              No pending submissions requiring validation at this time.
              Check back later or adjust your domain preferences.
            </p>
            <button className="btn-secondary">
              Update Validation Preferences
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Submissions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Market Analysis Q1 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Finance</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Validated
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.5 SOL</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Quantum Computing Breakthrough</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Technology</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">--</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpertInterface;
