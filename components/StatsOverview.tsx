
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface StatsOverviewProps {
  transactions: Transaction[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    let runningBalance = 0;
    const sorted = [...transactions]
      .filter(t => t.type === 'SESSION')
      .sort((a, b) => a.date - b.date);
      
    return sorted.map((t, idx) => {
      const change = t.isProfit ? t.amount : -t.amount;
      runningBalance += change;
      return {
        session: idx + 1,
        profit: runningBalance,
        date: new Date(t.date).toLocaleDateString()
      };
    });
  }, [transactions]);

  const totalSessions = transactions.filter(t => t.type === 'SESSION').length;
  const totalProfit = transactions.filter(t => t.type === 'SESSION').reduce((acc, t) => acc + (t.isProfit ? t.amount : -t.amount), 0);
  const winRate = totalSessions > 0 ? (transactions.filter(t => t.type === 'SESSION' && t.isProfit).length / totalSessions) * 100 : 0;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Profit</p>
          <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Win Rate</p>
          <p className="text-xl font-bold text-indigo-400">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Sessions</p>
          <p className="text-xl font-bold text-slate-200">{totalSessions}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
           <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Avg Profit</p>
           <p className="text-xl font-bold text-emerald-400">
             ${totalSessions > 0 ? (totalProfit / totalSessions).toFixed(2) : '0.00'}
           </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h3 className="font-bold text-sm text-slate-400 mb-4 uppercase tracking-widest">Growth Curve</h3>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="session" stroke="#475569" fontSize={10} hide />
              <YAxis stroke="#475569" fontSize={10} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Performance Insights</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-6 md:gap-12 md:justify-around">
           <div className="text-center">
              <p className="text-slate-500 text-[10px] font-bold">BEST SESSION</p>
              <p className="font-bold text-2xl text-indigo-400">
                ${Math.max(...transactions.filter(t => t.type === 'SESSION').map(t => t.isProfit ? t.amount : -t.amount), 0).toFixed(2)}
              </p>
           </div>
           <div className="text-center hidden md:block w-px bg-slate-800"></div>
           <div className="text-center">
              <p className="text-slate-500 text-[10px] font-bold">WORST SESSION</p>
              <p className="font-bold text-2xl text-rose-500">
                ${Math.min(...transactions.filter(t => t.type === 'SESSION').map(t => t.isProfit ? t.amount : -t.amount), 0).toFixed(2)}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
