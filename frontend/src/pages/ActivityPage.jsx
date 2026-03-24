import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, UserPlus, TrendingUp, Info, ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatTimeAgo = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const iconMap = {
  registration: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Registration' },
  event_created: { icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-100', label: 'New Event' },
  workshop_created: { icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-100', label: 'New Workshop' },
  attendance: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Attendance' },
};

const ActivityRow = ({ type, message, time, delay = 0 }) => {
  const { icon: Icon, color, bg, label } = iconMap[type] || { icon: Info, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Update' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 border border-slate-100/50 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${bg} ${color}`}>
               {label}
             </span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
               {formatTimeAgo(time)}
             </span>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-700 leading-relaxed truncate md:whitespace-normal">
            {message}
          </p>
        </div>
      </div>
      
      <div className="hidden md:block text-right shrink-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(time).toLocaleDateString([], { weekday: 'long' })}
        </p>
        <p className="text-[10px] text-slate-300 font-medium">
            {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullActivity = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) return;
        
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/analytics/activity', config);
        setActivities(data);
        setFilteredActivities(data);
      } catch (err) {
        console.error("Failed to fetch full activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullActivity();
  }, []);

  useEffect(() => {
    let result = activities;
    
    if (filter !== 'all') {
      result = result.filter(a => a.type === filter);
    }
    
    if (search) {
      result = result.filter(a => a.message.toLowerCase().includes(search.toLowerCase()));
    }
    
    setFilteredActivities(result);
  }, [search, filter, activities]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Compiling Global History...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-4 group"
           >
             <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
             Back to Intelligence
           </button>
           <h1 className="text-4xl font-serif font-black text-slate-950 tracking-tighter">Campus Activity</h1>
           <p className="text-slate-500 font-medium mt-2">Comprehensive logs of all system-wide interactions and events.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-widest">Live Sync Enabled</span>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search logs by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pl-12 pr-6 text-sm outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-100">
          {['all', 'registration', 'event_created', 'workshop_created'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f === 'all' ? 'All Logs' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, i) => (
            <ActivityRow key={i} {...activity} delay={i * 0.03} />
          ))
        ) : (
          <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Info className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching activities found</p>
             <button 
               onClick={() => {setSearch(''); setFilter('all');}}
               className="mt-4 text-xs font-bold text-indigo-600 underline underline-offset-4"
             >
               Clear all filters
             </button>
          </div>
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="pt-10 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">End of history • Showing top 100 entries</p>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
