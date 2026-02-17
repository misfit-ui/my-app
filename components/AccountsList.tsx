
import React, { useState } from 'react';
import { Account, AccountType, Transaction } from '../types';
import { Plus, Edit2, Trash2, X, Check, Download, Share2, Database } from 'lucide-react';

interface AccountsListProps {
  accounts: Account[];
  onAdd: (account: Omit<Account, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Account>) => void;
  onDelete: (id: string) => void;
  // Added transactions prop for export functionality
  transactions?: Transaction[];
}

const AccountsList: React.FC<AccountsListProps> = ({ accounts, onAdd, onUpdate, onDelete, transactions = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return alert('No transaction data to export.');
    
    const headers = ['Date', 'Type', 'Account', 'Amount', 'Direction'];
    const rows = transactions.map(t => [
      new Date(t.date).toISOString(),
      t.type,
      accounts.find(a => a.id === t.toId)?.name || 'Unknown',
      t.amount,
      t.type === 'SESSION' ? (t.isProfit ? 'Profit' : 'Loss') : 'Transfer'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `acetrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyBackup = () => {
    const data = localStorage.getItem('acetrack_bankroll_v1');
    if (data) {
      navigator.clipboard.writeText(data);
      alert('Database backup copied to clipboard! Save this string somewhere safe.');
    }
  };

  return (
    <div className="p-4 pb-12 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">Accounts</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white p-2 rounded-xl flex items-center gap-2 px-4 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span className="text-xs font-black uppercase tracking-widest">New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group relative overflow-hidden transition-all hover:border-slate-700">
            <div className="flex items-center gap-4 z-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-800 border border-white/5`}>
                {acc.icon}
              </div>
              <div>
                <h3 className="font-bold">{acc.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-black px-1.5 py-0.5 bg-slate-800/50 rounded tracking-widest">
                    {acc.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 z-0">
              <div className="text-right">
                <p className="text-lg font-black tracking-tight">
                  ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden ml-auto">
                  <div className="h-full bg-indigo-500 w-full opacity-50"></div>
                </div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEdit(acc)}
                  className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDelete(acc.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Management Section */}
      <div className="mt-8 pt-8 border-t border-slate-800/50">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-1">Data Management</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={exportToCSV}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors"
          >
            <Download size={20} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Export CSV</span>
          </button>
          <button 
            onClick={copyBackup}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors"
          >
            <Database size={20} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Backup JSON</span>
          </button>
        </div>
      </div>

      {showModal && (
        <AccountModal 
          account={editingAccount} 
          onClose={() => setShowModal(false)} 
          onSave={(data) => {
            if (editingAccount) {
              onUpdate(editingAccount.id, data);
            } else {
              onAdd({ ...data, balance: 0, color: 'bg-indigo-500' });
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

interface AccountModalProps {
  account: Account | null;
  onClose: () => void;
  onSave: (data: { name: string, type: AccountType, icon: string }) => void;
}

const AccountModal = ({ account, onClose, onSave }: AccountModalProps) => {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState<AccountType>(account?.type || 'Site');
  const [icon, setIcon] = useState(account?.icon || '♠️');

  const icons = ['♠️', '🃏', '🦊', '🛡️', '💵', '💰', '🏦', '💎', '📈', '📱', '💻', '🔥', '⭐️'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom duration-300 border-t border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black">{account ? 'Edit Account' : 'Add Account'}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Name</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Party Poker"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Type</label>
            <div className="flex gap-2">
              {(['Site', 'Wallet', 'Cash'] as AccountType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                    type === t ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${
                    icon === i ? 'bg-slate-700 border-indigo-500 scale-110' : 'bg-slate-800 border-slate-800 opacity-50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!name}
            onClick={() => onSave({ name, type, icon })}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-50"
          >
            <Check size={20} strokeWidth={3} />
            {account ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsList;
