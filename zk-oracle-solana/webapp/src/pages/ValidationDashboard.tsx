import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface ValidationRequest {
  id: string;
  title: string;
  domain: string;
  requestedAt: string;
  deadline: string;
  status: 'pending' | 'completed' | 'expired';
  reward: number;
}

interface ValidationStats {
  totalValidated: number;
  successRate: number;
  avgResponseTime: number;
  trustScore: number;
  totalRewards: number;
}

const mockValidationRequests: ValidationRequest[] = [
  {
    id: 'val-1',
    title: 'Market Analysis for Tech Sector',
    domain: 'Finance',
    requestedAt: '2025-03-27T09:15:00Z',
    deadline: '2025-03-28T09:15:00Z',
    status: 'pending',
    reward: 1.2,
  },
  {
    id: 'val-2',
    title: 'Biometric Authentication Research',
    domain: 'Technology',
    requestedAt: '2025-03-27T10:30:00Z',
    deadline: '2025-03-29T10:30:00Z',
    status: 'pending',
    reward: 1.5,
  },
  {
    id: 'val-3',
    title: 'Climate Data Analysis',
    domain: 'Science',
    requestedAt: '2025-03-26T15:45:00Z',
    deadline: '2025-03-27T15:45:00Z',
    status: 'expired',
    reward: 0.8,
  },
  {
    id: 'val-4',
    title: 'Medical Research Verification',
    domain: 'Healthcare',
    requestedAt: '2025-03-25T11:20:00Z',
    deadline: '2025-03-26T11:20:00Z',
    status: 'completed',
    reward: 2.0,
  },
];

const mockStats: ValidationStats = {
  totalValidated: 127,
  successRate: 94.5,
  avgResponseTime: 4.3,
  trustScore: 89.2,
  totalRewards: 215.7,
};

const ValidationDashboard: React.FC = () => {
  const { connected } = useWallet();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'history'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [domainFilters, setDomainFilters] = useState<string[]>([]);

  const handleDomainFilterToggle = (domain: string) => {
    if (domainFilters.includes(domain)) {
      setDomainFilters(domainFilters.filter(d => d !== domain));
    } else {
      setDomainFilters([...domainFilters, domain]);
    }
  };

  const filteredRequests = mockValidationRequests.filter(
    (request) => 
      (selectedTab === 'pending' ? request.status === 'pending' : request.status !== 'pending') &&
      (domainFilters.length === 0 || domainFilters.includes(request.domain))
  );

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect Wallet to Continue</h2>
        <p className="text-gray-600 mb-6">
          You need to connect your Solana wallet to participate in validation.
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Validation Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Participate in cross-validation to verify information, build trust, and earn rewards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Total Validated</div>
            <div className="text-2xl font-bold text-primary">{mockStats.totalValidated}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">{mockStats.successRate}%</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Avg Response Time</div>
            <div className="text-2xl font-bold text-purple-600">{mockStats.avgResponseTime}h</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Trust Score</div>
            <div className="text-2xl font-bold text-primary">{mockStats.trustScore}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Total Rewards</div>
            <div className="text-2xl font-bold text-green-600">{mockStats.totalRewards} SOL</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card h-full flex flex-col">
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 text-center ${
                  selectedTab === 'pending'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('pending')}
              >
                Pending
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  selectedTab === 'history'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('history')}
              >
                History
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Filter by Domain:</div>
              <div className="flex flex-wrap gap-2">
                {['Finance', 'Technology', 'Healthcare', 'Science'].map((domain) => (
                  <button
                    key={domain}
                    className={`px-2 py-1 text-xs rounded-full ${
                      domainFilters.includes(domain)
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleDomainFilterToggle(domain)}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      selectedRequest?.id === request.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{request.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{request.domain}</span>
                      <span>{request.reward} SOL</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Deadline: {new Date(request.deadline).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No validation requests found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedRequest ? (
            <div className="card h-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-800">{selectedRequest.title}</h3>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedRequest.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedRequest.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Domain</div>
                  <div>{selectedRequest.domain}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reward</div>
                  <div className="font-semibold text-green-600">{selectedRequest.reward} SOL</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Requested</div>
                  <div>{new Date(selectedRequest.requestedAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Deadline</div>
                  <div className="font-semibold">{new Date(selectedRequest.deadline).toLocaleString()}</div>
                </div>
              </div>

              {selectedRequest.status === 'pending' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-2">Validation Instructions:</div>
                    <p className="text-gray-600">
                      Please review the provided information and validate its accuracy. Your response should include:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                      <li>Verification of factual accuracy</li>
                      <li>Source credibility assessment</li>
                      <li>Methodology review</li>
                      <li>Confidence level in your validation</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button className="btn-secondary">
                      Skip Request
                    </button>
                    <button className="btn-primary">
                      Validate with ZK Proof
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {selectedRequest.status === 'completed' ? 'Validation Result:' : 'Expired Notice:'}
                  </div>
                  <p className="text-gray-600">
                    {selectedRequest.status === 'completed'
                      ? 'You successfully validated this information. Your validation was consistent with the consensus result and you received the full reward.'
                      : 'This validation request has expired and is no longer available.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-2">Select a validation request to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationDashboard;
