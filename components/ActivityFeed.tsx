
import React, { useMemo } from 'react';
import { Transaction, Account } from '../types';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Clock, Calendar } from 'lucide-react';

interface ActivityFeedProps {
  transactions: Transaction[];
  accounts: Account[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ transactions, accounts }) => {
  const getAccount = (id?: string) => accounts.find(a => a.id === id);

  // Guarantee newest transactions appear first
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date - a.date);
  }, [transactions]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-black tracking-tight">History</h2>
        <div className="flex items-center gap-1 text-slate-500">
          <Calendar size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{transactions.length} Events</span>
        </div>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-700">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
            <Clock size={32} strokeWidth={1.5} className="opacity-20" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest">No activity yet</p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase">Your sessions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map(t => {
            const from = getAccount(t.fromId);
            const to = getAccount(t.toId);

            return (
              <div key={t.id} className="bg-slate-900 border border-slate-800/50 p-4 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-slate-700 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {t.type === 'TRANSFER' ? (
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <ArrowLeftRight size={14} />
                      </div>
                    ) : t.isProfit ? (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <ArrowUpRight size={14} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <ArrowDownLeft size={14} />
                      </div>
                    )}
                    <span className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      {t.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-400 uppercase">
                      {formatDate(t.date)}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-600 uppercase">
                      {formatTime(t.date)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    {t.type === 'TRANSFER' ? (
                      <div className="text-xs font-bold leading-relaxed">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-[9px] w-8">FROM</span> 
                          <span className="text-slate-300">{from?.icon} {from?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-500 text-[9px] w-8">TO</span> 
                          <span className="text-slate-300">{to?.icon} {to?.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                         <span className="text-lg">{to?.icon}</span>
                         <div>
                           <p className="text-sm font-bold text-slate-200">{to?.name}</p>
                           <p className="text-[10px] text-slate-500 font-medium uppercase">Poker Session</p>
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black tracking-tight ${t.type === 'TRANSFER' ? 'text-slate-300' : t.isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'TRANSFER' ? '' : t.isProfit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
