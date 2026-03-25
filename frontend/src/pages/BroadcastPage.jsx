import API_BASE_URL from '../config/api.js';
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Megaphone, Send, AlertCircle, CheckCircle, Info } from 'lucide-react';

const API_URL = `${API_BASE_URL}/api/notifications/broadcast`;

const BroadcastPage = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.length < 5) {
      setError('Broadcast content must be substantial (min 5 characters).');
      return;
    }
    setError('');
    setStatus('');
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        setError('Authorization required to initiate global broadcast.');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(API_URL, { message }, config);

      setStatus('Success! The academic community has been notified.');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Broadcast transmission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans min-h-screen">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          {/* Subtle decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="inline-flex p-4 rounded-3xl bg-white/10 mb-6 backdrop-blur-md">
            <Megaphone className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white font-serif mb-3 tracking-tight">Global Broadcast</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Institutional Communication Hub</p>
        </div>

        <div className="p-12 space-y-10">
          <div className="flex items-start gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-800 font-medium leading-relaxed">
              This action will transmit an immediate notification to all active students and faculty accounts. 
              Please ensure the content is accurate and professional.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-bold flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
            
            {status && (
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-2xl border border-emerald-100 font-bold flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                {status}
              </motion.div>
            )}

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                Broadcast Content
              </label>
              <textarea
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-medium focus:bg-white focus:ring-4 focus:ring-slate-100/50 transition-all outline-none resize-none h-48 placeholder:text-slate-300"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter the official announcement content here..."
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-slate-900 hover:bg-black text-white font-bold text-sm uppercase tracking-[0.4em] rounded-[2rem] transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? 'Transmitting Data...' : (
                  <>
                    Launch Broadcast <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BroadcastPage;