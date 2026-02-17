
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Home as HomeIcon, 
  Wallet, 
  History, 
  BarChart3, 
  Plus, 
  ArrowLeftRight,
  TrendingUp,
  X,
  Check,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { db } from './services/db';
import { Account, Transaction, BankrollData } from './types';
import Dashboard from './components/Dashboard';
import AccountsList from './components/AccountsList';
import ActivityFeed from './components/ActivityFeed';
import StatsOverview from './components/StatsOverview';

type Tab = 'home' | 'accounts' | 'activity' | 'stats';

export default function App() {
  const [data, setData] = useState<BankrollData>(() => db.load());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  // Persist data whenever it changes
  useEffect(() => {
    db.save(data);
  }, [data]);

  const totalBankroll = useMemo(() => {
    return data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [data.accounts]);

  const handleBulkSessionUpdate = useCallback((updates: { accountId: string, endBalance: number }[]) => {
    const newTransactions: Transaction[] = [];
    const newAccounts = [...data.accounts];
    const baseDate = Date.now();

    updates.forEach(({ accountId, endBalance }, index) => {
      const accIndex = newAccounts.findIndex(a => a.id === accountId);
      if (accIndex === -1) return;

      const oldBalance = newAccounts[accIndex].balance;
      const delta = endBalance - oldBalance;

      if (Math.abs(delta) < 0.01) return;

      newTransactions.push({
        id: `txn-${baseDate}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'SESSION',
        amount: Math.abs(delta),
        toId: accountId,
        date: baseDate + index,
        isProfit: delta > 0
      });

      newAccounts[accIndex] = { ...newAccounts[accIndex], balance: endBalance };
    });

    if (newTransactions.length > 0) {
      setData(prev => ({
        accounts: newAccounts,
        transactions: [...newTransactions, ...prev.transactions]
      }));
    }
    setShowSessionModal(false);
  }, [data.accounts]);

  const handleTransfer = useCallback((fromId: string, toId: string, amount: number) => {
    if (fromId === toId || amount <= 0) return;

    const newTransaction: Transaction = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'TRANSFER',
      amount: amount,
      fromId: fromId,
      toId: toId,
      date: Date.now(),
    };

    const newAccounts = data.accounts.map(acc => {
      if (acc.id === fromId) {
        return { ...acc, balance: acc.balance - amount };
      }
      if (acc.id === toId) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    setData(prev => ({
      accounts: newAccounts,
      transactions: [newTransaction, ...prev.transactions]
    }));
    setShowTransferModal(false);
  }, [data.accounts]);

  const handleAddAccount = useCallback((account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount]
    }));
  }, []);

  const handleUpdateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc)
    }));
  }, []);

  const confirmDeleteAccount = useCallback(() => {
    if (!accountToDelete) return;
    setData(prev => ({
      accounts: prev.accounts.filter(acc => acc.id !== accountToDelete),
      transactions: prev.transactions.filter(t => t.fromId !== accountToDelete && t.toId !== accountToDelete)
    }));
    setAccountToDelete(null);
  }, [accountToDelete]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 text-slate-50 relative overflow-hidden">
      <header className="p-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold italic shadow-lg shadow-indigo-500/20">A</div>
          <h1 className="text-xl font-bold tracking-tight">AceTrack</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <ArrowLeftRight size={20} className="text-indigo-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {activeTab === 'home' && <Dashboard data={data} totalBankroll={totalBankroll} onAddSession={() => setShowSessionModal(true)} />}
        {activeTab === 'accounts' && (
          <AccountsList 
            accounts={data.accounts} 
            transactions={data.transactions}
            onAdd={handleAddAccount} 
            onUpdate={handleUpdateAccount} 
            onDelete={setAccountToDelete} 
          />
        )}
        {activeTab === 'activity' && <ActivityFeed transactions={data.transactions} accounts={data.accounts} />}
        {activeTab === 'stats' && <StatsOverview transactions={data.transactions} />}
      </main>

      <button 
        onClick={() => setShowSessionModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/40 active:scale-90 transition-transform z-20"
      >
        <Plus size={32} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-2 py-3 safe-bottom z-30">
        <NavButton icon={HomeIcon} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={Wallet} label="Accounts" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
        <NavButton icon={History} label="Activity" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
        <NavButton icon={BarChart3} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
      </nav>

      {showSessionModal && (
        <SessionModal 
          accounts={data.accounts} 
          onClose={() => setShowSessionModal(false)} 
          onSubmit={handleBulkSessionUpdate} 
        />
      )}
      {showTransferModal && (
        <TransferModal 
          accounts={data.accounts} 
          onClose={() => setShowTransferModal(false)} 
          onSubmit={handleTransfer} 
        />
      )}
      {accountToDelete && (
        <DeleteConfirmModal 
          accountName={data.accounts.find(a => a.id === accountToDelete)?.name || ''}
          onClose={() => setAccountToDelete(null)} 
          onConfirm={confirmDeleteAccount}
        />
      )}
    </div>
  );
}

const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const DeleteConfirmModal = ({ accountName, onClose, onConfirm }: { accountName: string, onClose: () => void, onConfirm: () => void }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-center font-black text-lg mb-2">Delete Account?</h3>
      <p className="text-center text-xs text-slate-500 mb-6 leading-relaxed uppercase tracking-tight font-bold">
        Are you sure you want to delete <span className="text-slate-200">"{accountName}"</span>? All history will be permanently lost.
      </p>
      <div className="flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-sm transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="flex-1 bg-rose-600 hover:bg-rose-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  </div>
);

interface SessionModalProps {
  accounts: Account[];
  onClose: () => void;
  onSubmit: (updates: { accountId: string, endBalance: number }[]) => void;
}

const SessionModal = ({ accounts, onClose, onSubmit }: SessionModalProps) => {
  const sessionAccounts = accounts.filter(a => a.type === 'Site' || a.type === 'Cash');
  const [endBalances, setEndBalances] = useState<Record<string, string>>({});

  const handleBalanceChange = (id: string, value: string) => {
    setEndBalances(prev => ({ ...prev, [id]: value }));
  };

  const submitSessions = () => {
    const updates = Object.entries(endBalances)
      .filter(([_, val]) => val.trim() !== '' && !isNaN(parseFloat(val)))
      .map(([id, val]) => ({
        accountId: id,
        endBalance: parseFloat(val)
      }));
    
    if (updates.length > 0) {
      onSubmit(updates);
    } else {
      onClose();
    }
  };

  const totalDelta = Object.entries(endBalances).reduce((acc, [id, val]) => {
    const numericVal = parseFloat(val);
    if (val.trim() === '' || isNaN(numericVal)) return acc;
    const currentAcc = accounts.find(a => a.id === id);
    if (!currentAcc) return acc;
    return acc + (numericVal - currentAcc.balance);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom duration-300 border-t border-slate-800 flex flex-col max-h-[95vh]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Session Summary</h2>
            <p className="text-xs text-slate-500">Log results for sites played</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
          {sessionAccounts.map(acc => {
            const endVal = endBalances[acc.id] || '';
            const delta = endVal !== '' && !isNaN(parseFloat(endVal)) ? parseFloat(endVal) - acc.balance : 0;
            
            return (
              <div key={acc.id} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all focus-within:border-indigo-500/50 focus-within:bg-slate-800/60">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-2xl">{acc.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Current: ${acc.balance.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      value={endVal}
                      onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                      placeholder={acc.balance.toFixed(2)}
                      className="w-24 bg-slate-950 border border-slate-700 rounded-lg p-2 pl-5 text-right text-sm font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-800 transition-all"
                    />
                  </div>
                  {endVal !== '' && !isNaN(parseFloat(endVal)) && (
                    <span className={`text-[10px] font-bold ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
           <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-sm font-bold text-slate-400">Total Change</span>
              <span className={`text-xl font-black ${totalDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalDelta >= 0 ? '+' : '-'}${Math.abs(totalDelta).toFixed(2)}
              </span>
           </div>
           <button 
            onClick={submitSessions}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
          >
            <Check size={20} strokeWidth={3} />
            Update {Object.keys(endBalances).filter(k => endBalances[k] !== '').length} Accounts
          </button>
        </div>
      </div>
    </div>
  );
};

interface TransferModalProps {
  accounts: Account[];
  onClose: () => void;
  onSubmit: (fromId: string, toId: string, amount: number) => void;
}

const TransferModal = ({ accounts, onClose, onSubmit }: TransferModalProps) => {
  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom duration-300 border-t border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Move Money</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-400">Source</label>
              <select 
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full bg-slate-800 rounded-xl p-3 font-medium outline-none border border-slate-700 focus:border-indigo-500 transition-colors"
              >
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>)}
              </select>
            </div>
            <ArrowLeftRight className="mt-6 text-slate-500" size={20} />
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-400">Destination</label>
              <select 
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-slate-800 rounded-xl p-3 font-medium outline-none border border-slate-700 focus:border-indigo-500 transition-colors"
              >
                {accounts.filter(acc => acc.id !== fromId).map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Transfer Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">$</span>
              <input 
                autoFocus
                type="number" 
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border-none rounded-xl p-3 pl-8 text-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            disabled={!amount || fromId === toId}
            onClick={() => onSubmit(fromId, toId, parseFloat(amount))}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/40"
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  );
};
