import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Calendar, CheckCircle, TrendingUp, Info, ChevronRight } from 'lucide-react';
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
  return d.toLocaleDateString();
};

const iconMap = {
  registration: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  event_created: { icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-100' },
  attendance: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  trend: { icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const ActivityItem = ({ type, message, time, delay = 0 }) => {
  const { icon: Icon, color, bg } = iconMap[type] || { icon: Info, color: 'text-slate-400', bg: 'bg-slate-50' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex gap-3 py-3 px-3 rounded-xl hover:bg-slate-50/80 transition-colors cursor-default group"
    >
      <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-slate-700 leading-snug line-clamp-2">{message}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{formatTimeAgo(time)}</p>
      </div>
    </motion.div>
  );
};

const ActivityFeed = ({ title = "Activity", activities = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
        {activities.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-slate-400">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, i) => (
            <ActivityItem key={i} {...activity} delay={i * 0.04} />
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="p-3 border-t border-slate-50">
          <button 
            onClick={() => navigate('/admin/activity')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:text-indigo-600 transition-all duration-300 group"
          >
            See Full History
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
