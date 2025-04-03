import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import pages
import NavBar from './components/common/NavBar';
import HomePage from './pages/HomePage';
import ExpertInterface from './pages/ExpertInterface';
import DataExplorer from './pages/DataExplorer';
import ValidationDashboard from './pages/ValidationDashboard';
import TrustScoreMonitor from './pages/TrustScoreMonitor';

// Import styles
import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Set up Solana connection
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <Provider store={store}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Router>
              <div className="min-h-screen bg-gray-100">
                <NavBar />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/expert" element={<ExpertInterface />} />
                    <Route path="/explorer" element={<DataExplorer />} />
                    <Route path="/validation" element={<ValidationDashboard />} />
                    <Route path="/trust-score" element={<TrustScoreMonitor />} />
                  </Routes>
                </main>
                <footer className="bg-gray-800 text-white p-4 mt-8">
                  <div className="container mx-auto">
                    <p className="text-center">© 2025 Zero-Knowledge Oracle System on Solana</p>
                  </div>
                </footer>
              </div>
            </Router>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Provider>
  );
}

export default App;
