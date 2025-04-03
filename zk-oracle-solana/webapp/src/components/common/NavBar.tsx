import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const NavBar: React.FC = () => {
  const { connected } = useWallet();

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">
            ZK Oracle System
          </Link>
          <div className="hidden md:flex ml-10 space-x-4">
            <Link to="/" className="hover:text-primary-light transition-colors">
              Home
            </Link>
            <Link to="/expert" className="hover:text-primary-light transition-colors">
              Expert Interface
            </Link>
            <Link to="/explorer" className="hover:text-primary-light transition-colors">
              Data Explorer
            </Link>
            <Link to="/validation" className="hover:text-primary-light transition-colors">
              Validation
            </Link>
            <Link to="/trust-score" className="hover:text-primary-light transition-colors">
              Trust Scores
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <WalletMultiButton className="!bg-primary hover:!bg-primary-dark" />
          {connected && (
            <span className="ml-3 bg-green-500 px-2 py-1 rounded text-xs font-semibold">
              Connected
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
