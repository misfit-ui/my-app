
import { BankrollData } from '../types';
import { INITIAL_ACCOUNTS, STORAGE_KEY } from '../constants';

export const db = {
  save: (data: BankrollData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  load: (): BankrollData => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse storage', e);
      }
    }
    return {
      accounts: INITIAL_ACCOUNTS,
      transactions: [],
    };
  }
};
