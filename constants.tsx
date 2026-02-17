
import { Account } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'CoinPoker', type: 'Site', balance: 0.00, icon: '♠️', color: 'bg-red-500' },
  { id: '2', name: 'GG Poker', type: 'Site', balance: 0.00, icon: '🃏', color: 'bg-yellow-600' },
  { id: '3', name: 'MetaMask', type: 'Wallet', balance: 0.00, icon: '🦊', color: 'bg-orange-500' },
  { id: '4', name: 'Ledger', type: 'Wallet', balance: 0.00, icon: '🛡️', color: 'bg-blue-600' },
  { id: '5', name: 'Cash Wallet', type: 'Cash', balance: 0.00, icon: '💵', color: 'bg-green-600' },
];

export const STORAGE_KEY = 'acetrack_bankroll_v1';

// Time Constants
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const SEVEN_DAYS_MS = 7 * MS_PER_DAY;
