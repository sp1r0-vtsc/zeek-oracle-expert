import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface TrustScoreData {
  date: string;
  score: number;
  validationRate: number;
  consistencyFactor: number;
  accuracyFactor: number;
}

interface RewardHistory {
  id: string;
  date: string;
  amount: number;
  reason: string;
  txHash: string;
}

const mockTrustScoreHistory: TrustScoreData[] = [
  { date: '2025-03-27', score: 89.2, validationRate: 94.5, consistencyFactor: 85.3, accuracyFactor: 91.7 },
  { date: '2025-03-20', score: 87.5, validationRate: 92.1, consistencyFactor: 84.9, accuracyFactor: 89.2 },
  { date: '2025-03-13', score: 85.9, validationRate: 89.8, consistencyFactor: 83.2, accuracyFactor: 88.1 },
  { date: '2025-03-06', score: 83.1, validationRate: 87.2, consistencyFactor: 81.7, accuracyFactor: 85.4 },
  { date: '2025-02-28', score: 81.4, validationRate: 85.0, consistencyFactor: 80.1, accuracyFactor: 83.9 },
  { date: '2025-02-21', score: 79.8, validationRate: 82.3, consistencyFactor: 78.5, accuracyFactor: 82.7 },
];

const mockRewardHistory: RewardHistory[] = [
  {
    id: '1',
    date: '2025-03-26T15:23:05Z',
    amount: 2.5,
    reason: 'Market Analysis Validation',
    txHash: '0x4a3...d71',
  },
  {
    id: '2',
    date: '2025-03-24T09:47:12Z',
    amount: 1.8,
    reason: 'Technology Report Submission',
    txHash: '0x7b2...e38',
  },
  {
    id: '3',
    date: '2025-03-21T11:32:45Z',
    amount: 3.2,
    reason: 'Healthcare Data Validation',
    txHash: '0x2f5...a91',
  },
  {
    id: '4',
    date: '2025-03-18T14:15:30Z',
    amount: 1.5,
    reason: 'Science Report Submission',
    txHash: '0x9c8...b42',
  },
];

const TrustScoreMonitor: React.FC = () => {
  const { connected } = useWallet();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history'>('overview');
  const currentScore = mockTrustScoreHistory[0];

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect Wallet to Continue</h2>
        <p className="text-gray-600 mb-6">
          You need to connect your Solana wallet to view your trust score information.
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Trust Score Monitor</h2>
        <p className="text-gray-600 mb-6">
          Track your trust score, performance metrics, and reward history over time.
        </p>

        <div className="flex mb-6">
          <button
            className={`px-4 py-2 rounded-l-lg ${
              selectedTab === 'overview'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSelectedTab('overview')}
          >
            Score Overview
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${
              selectedTab === 'history'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSelectedTab('history')}
          >
            Reward History
          </button>
        </div>

        {selectedTab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Current Trust Score</div>
                <div className="text-4xl font-bold text-primary">{currentScore.score}</div>
                <div className="text-xs text-gray-500 mt-1">Updated {new Date(currentScore.date).toLocaleDateString()}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Validation Rate</div>
                <div className="text-4xl font-bold text-green-600">{currentScore.validationRate}%</div>
                <div className="text-xs text-gray-500 mt-1">Success in validation tasks</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Consistency Factor</div>
                <div className="text-4xl font-bold text-purple-600">{currentScore.consistencyFactor}</div>
                <div className="text-xs text-gray-500 mt-1">Temporal reliability rating</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Accuracy Factor</div>
                <div className="text-4xl font-bold text-yellow-600">{currentScore.accuracyFactor}</div>
                <div className="text-xs text-gray-500 mt-1">Historical correctness</div>
              </div>
            </div>

            <div className="card bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trust Score Factors</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Validation Rate</span>
                    <span className="text-sm font-medium text-gray-700">{currentScore.validationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${currentScore.validationRate}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of your validations that match the consensus result
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Consistency Factor</span>
                    <span className="text-sm font-medium text-gray-700">{currentScore.consistencyFactor}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${currentScore.consistencyFactor}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Measures how consistent your contributions and validations are over time
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Accuracy Factor</span>
                    <span className="text-sm font-medium text-gray-700">{currentScore.accuracyFactor}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${currentScore.accuracyFactor}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Reflects the historical accuracy of your submitted information
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trust Score Progression</h3>
              <div className="bg-white rounded-lg shadow-md p-4 h-64 flex items-end justify-between">
                {mockTrustScoreHistory.map((data, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">{new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    <div 
                      className="w-12 bg-primary rounded-t-sm" 
                      style={{ height: `${data.score / 1.5}%` }}
                    ></div>
                    <div className="text-xs font-medium mt-2">{data.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Improving Your Trust Score</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Participate regularly in validation tasks to improve your consistency factor
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Submit well-researched information with strong supporting evidence
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Validate information in domains where you have expertise
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Use ZK proofs to verify your credentials and information sources
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Reward History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockRewardHistory.map((reward) => (
                    <tr key={reward.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(reward.date).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">{reward.amount} SOL</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reward.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{reward.txHash}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium text-gray-700">Total Rewards</div>
                <div className="text-lg font-bold text-green-600">
                  {mockRewardHistory.reduce((sum, reward) => sum + reward.amount, 0)} SOL
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Your reward amount is influenced by your trust score, staking amount, and the uniqueness and 
                value of your contributions. Higher trust scores lead to higher reward multipliers.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustScoreMonitor;
