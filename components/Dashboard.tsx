
import React, { useMemo } from 'react';
import { BankrollData } from '../types';
import { TrendingUp, TrendingDown, Target, Wallet, Globe, Banknote } from 'lucide-react';
import { SEVEN_DAYS_MS } from '../constants';

interface DashboardProps {
  data: BankrollData;
  totalBankroll: number;
  onAddSession: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, totalBankroll, onAddSession }) => {
  const lastSessions = useMemo(() => {
    return [...data.transactions]
      .filter(t => t.type === 'SESSION')
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  }, [data.transactions]);
  
  const weeklyStats = useMemo(() => {
    const now = Date.now();
    const periodTransactions = data.transactions.filter(
      t => t.type === 'SESSION' && t.date > now - SEVEN_DAYS_MS
    );
    
    const profit = periodTransactions.reduce((acc, t) => acc + (t.isProfit ? t.amount : -t.amount), 0);
    
    // Calculate ROI relative to the bankroll at the start of the week
    const startingBankroll = totalBankroll - profit;
    const roi = startingBankroll > 0 ? (profit / startingBankroll) * 100 : 0;
    
    return { profit, roi };
  }, [data.transactions, totalBankroll]);

  const composition = useMemo(() => {
    const totals = {
      Site: 0,
      Wallet: 0,
      Cash: 0
    };
    data.accounts.forEach(acc => {
      totals[acc.type] += acc.balance;
    });
    return totals;
  }, [data.accounts]);

  const formatCurrency = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-4 space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
      {/* Left Column: Net Worth & Actions */}
      <div className="space-y-6">
        {/* Total Bankroll Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 shadow-xl shadow-indigo-900/40 relative overflow-hidden group">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-700 group-hover:scale-110">
            <Globe size={120} />
          </div>

          <div className="relative z-10">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Net Worth</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 overflow-hidden text-ellipsis">
              ${formatCurrency(totalBankroll)}
            </h2>
            
            {/* Breakdown Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/5">
                <Globe size={10} className="text-indigo-300" />
                <span className="text-[9px] font-black text-indigo-100 uppercase tracking-tighter">
                  Sites: ${formatCurrency(composition.Site)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/5">
                <Wallet size={10} className="text-emerald-300" />
                <span className="text-[9px] font-black text-emerald-100 uppercase tracking-tighter">
                  Wallets: ${formatCurrency(composition.Wallet)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/5">
                <Banknote size={10} className="text-amber-300" />
                <span className="text-[9px] font-black text-amber-100 uppercase tracking-tighter">
                  Cash: ${formatCurrency(composition.Cash)}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 flex flex-col gap-1 border border-white/5 hover:bg-white/15 transition-colors">
                <span className="text-[10px] text-indigo-100 uppercase font-black tracking-wider">7D ROI</span>
                <div className="flex items-center gap-1">
                  {weeklyStats.roi >= 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}
                  <span className="text-sm font-black">{Math.abs(weeklyStats.roi).toFixed(1)}%</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 flex flex-col gap-1 border border-white/5 hover:bg-white/15 transition-colors">
                <span className="text-[10px] text-indigo-100 uppercase font-black tracking-wider">7D Profit</span>
                <div className="flex items-center gap-1">
                  {weeklyStats.profit >= 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}
                  <span className="text-sm font-black">${formatCurrency(Math.abs(weeklyStats.profit))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={onAddSession}
            className="group flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl active:scale-[0.98] transition-all shadow-sm hover:border-indigo-500/30 hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center group-active:scale-110 transition-transform">
                <Target size={22} />
              </div>
              <div className="text-left">
                <p className="font-bold">End Session</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Update table balances</p>
              </div>
            </div>
            <TrendingUp size={18} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Right Column: Recent Activity */}
      <section className="space-y-3 h-full flex flex-col">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Latest Results</h3>
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Auto-sorted by date</span>
        </div>
        <div className="space-y-2 flex-1">
          {lastSessions.map((session) => {
            const acc = data.accounts.find(a => a.id === session.toId);
            return (
              <div key={session.id} className="bg-slate-900 border border-slate-800/50 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{acc?.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{acc?.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                      {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className={`font-black text-sm ${session.isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {session.isProfit ? '+' : '-'}${session.amount.toFixed(2)}
                </p>
              </div>
            );
          })}
          {lastSessions.length === 0 && (
            <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-slate-600 text-xs font-medium italic h-full flex items-center justify-center">
              No sessions recorded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
