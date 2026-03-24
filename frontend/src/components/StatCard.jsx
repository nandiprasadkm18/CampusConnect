import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, subtitle, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white p-6 rounded-2xl border border-slate-200/60 hover:border-slate-300/80 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300">
          <Icon className="w-4.5 h-4.5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight font-sans tabular-nums">{value}</h3>
        <p className="text-[11px] font-medium text-slate-500 mt-1 tracking-wide">{label}</p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
