import API_BASE_URL from '../config/api.js';
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { identifier, password });
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials provided');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-0">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight mb-1.5">Sign in to CampusConnect</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">Use your academic credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-50 text-red-700 text-[10px] rounded-xl border border-red-100 font-bold flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </motion.div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email or Phone Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-950 font-bold text-sm"
              placeholder="email@college.edu or +91..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-950 font-bold text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group max-w-xs mx-auto w-full py-3.5 bg-slate-950 hover:bg-black text-white font-bold text-xs uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
        >
          {isLoading ? 'Verifying...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;