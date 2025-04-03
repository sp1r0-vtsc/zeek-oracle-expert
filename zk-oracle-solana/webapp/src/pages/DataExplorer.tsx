import React, { useState } from 'react';

interface DataItem {
  id: string;
  title: string;
  domain: string;
  content: string;
  trustScore: number;
  timestamp: string;
  status: 'validated' | 'pending' | 'rejected';
  expert: string;
}

const mockData: DataItem[] = [
  {
    id: '1',
    title: 'Bitcoin Price Analysis',
    domain: 'Finance',
    content: 'Based on recent market trends and on-chain metrics, Bitcoin is expected to...',
    trustScore: 92,
    timestamp: '2025-03-25T14:32:00Z',
    status: 'validated',
    expert: '0x8a...3f',
  },
  {
    id: '2',
    title: 'Quantum Computing Breakthrough',
    domain: 'Technology',
    content: 'Researchers have achieved quantum supremacy in a new experiment that...',
    trustScore: 85,
    timestamp: '2025-03-23T09:14:00Z',
    status: 'validated',
    expert: '0x7b...2d',
  },
  {
    id: '3',
    title: 'New Medical Treatment for Alzheimer\'s',
    domain: 'Healthcare',
    content: 'Clinical trials show promising results for a new treatment that targets...',
    trustScore: 78,
    timestamp: '2025-03-20T11:45:00Z',
    status: 'validated',
    expert: '0x4e...9a',
  },
  {
    id: '4',
    title: 'Climate Change Impact Assessment',
    domain: 'Science',
    content: 'New data suggests that the rate of sea level rise will accelerate by...',
    trustScore: 89,
    timestamp: '2025-03-18T15:30:00Z',
    status: 'validated',
    expert: '0x2f...6c',
  },
];

const DataExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [selectedData, setSelectedData] = useState<DataItem | null>(null);

  const filteredData = mockData.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'all' || item.domain.toLowerCase() === domainFilter.toLowerCase();
    const matchesTrustScore = item.trustScore >= minTrustScore;
    
    return matchesSearch && matchesDomain && matchesTrustScore;
  });

  const handleDataItemClick = (item: DataItem) => {
    setSelectedData(item);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oracle Data Explorer</h2>
        <p className="text-gray-600 mb-6">
          Search and access verified oracle data with trust scores and proof of validation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="search">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or content..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="domain">
              Domain
            </label>
            <select
              id="domain"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Domains</option>
              <option value="finance">Finance</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="science">Science</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="trustScore">
              Minimum Trust Score: {minTrustScore}
            </label>
            <input
              type="range"
              id="trustScore"
              min="0"
              max="100"
              value={minTrustScore}
              onChange={(e) => setMinTrustScore(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Items</h3>
            <div className="space-y-2">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      selectedData?.id === item.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleDataItemClick(item)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-1 ${
                            item.status === 'validated'
                              ? 'bg-green-500'
                              : item.status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        ></span>
                        <span
                          className={`text-xs ${
                            item.trustScore >= 90
                              ? 'text-green-600'
                              : item.trustScore >= 70
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {item.trustScore}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.domain} • {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No data items match your search criteria
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedData ? (
            <div className="card h-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-800">{selectedData.title}</h3>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedData.status === 'validated'
                      ? 'bg-green-100 text-green-800'
                      : selectedData.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedData.status.charAt(0).toUpperCase() + selectedData.status.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Domain</div>
                  <div>{selectedData.domain}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Trust Score</div>
                  <div className="font-semibold text-primary">{selectedData.trustScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Timestamp</div>
                  <div>{new Date(selectedData.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Expert ID</div>
                  <div className="font-mono">{selectedData.expert}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Content</div>
                <div className="p-4 bg-gray-50 rounded-lg">{selectedData.content}</div>
              </div>

              <div className="flex space-x-4">
                <button className="btn-primary text-sm">
                  Verify ZK Proof
                </button>
                <button className="btn-secondary text-sm">
                  Export Data
                </button>
              </div>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2">Select a data item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
