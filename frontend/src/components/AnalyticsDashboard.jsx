import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Activity, Star } from 'lucide-react';

const COLORS = ['#6366f1', '#475569', '#1e293b', '#64748b', '#94a3b8'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) return;
        
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${API_BASE_URL}/api/analytics/overview`, config);
        setData(data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-20 text-center font-serif text-slate-400 animate-pulse uppercase tracking-[0.3em]">Syncing Institutional Intelligence...</div>;
  if (!data) return (
    <div className="p-12 text-center bg-slate-50 rounded-[3rem] border border-slate-100 italic text-slate-400">
      Access to the Analytics Hub requires an established administrative identity.
    </div>
  );

  const pieData = [
    { name: 'Events', value: data.summary.totalEvents || 0 },
    { name: 'Workshops', value: data.summary.totalWorkshops || 0 }
  ];

  const groupData = [
    { name: 'Individual', value: data.groupEngagement?.individualParticipants || 0 },
    { name: 'Group', value: data.groupEngagement?.groupParticipants || 0 }
  ];

  const summaryCards = [
    { label: 'Total Registrations', value: data.summary.totalRegistrations, icon: Users, color: 'text-slate-950' },
    { label: 'Attendance Efficiency', value: `${Math.round((data.summary.totalAttendance / data.summary.totalRegistrations) * 100) || 0}%`, icon: Activity, color: 'text-indigo-600' },
    { label: 'Academic Impact', value: data.summary.avgGlobalRating.toFixed(1), icon: Star, color: 'text-indigo-600' },
    { label: 'Active Teams', value: data.groupEngagement?.totalGroups || 0, icon: Users, color: 'text-slate-950' },
  ];

  return (
    <div className="space-y-12">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.label} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100/50 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <p className="text-3xl font-serif font-extrabold text-slate-950">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Departmental Reach Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">Departmental Reach</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-branch registration density</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={data.categoryPerformance} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[12, 12, 4, 4]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Engagement Mix Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-w-0"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">Engagement Mix</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Events vs Workshops distribution</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-[300px] w-full min-w-0">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
             {pieData.map((entry, i) => (
               <div key={entry.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{entry.name}</span>
               </div>
             ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
