
export type AccountType = 'Site' | 'Wallet' | 'Cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
}

export type TransactionType = 'SESSION' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  fromId?: string; // For transfers
  toId?: string;   // For transfers or sessions
  date: number;
  note?: string;
  isProfit?: boolean; // Only for SESSION
}

export interface BankrollData {
  accounts: Account[];
  transactions: Transaction[];
}
