import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Phone, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const OTPVerification = ({ onVerified }) => {
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = '/api/otp/verify-email';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_BASE_URL}${endpoint}`, { otp }, config);
      
      setSuccess(data.message);
      
      // Update local storage user data
      const updatedUser = { ...user, isEmailVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onVerified) {
        setTimeout(() => onVerified(updatedUser), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = '/api/otp/send-email';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_BASE_URL}${endpoint}`, {}, config);
      setSuccess('A new OTP has been sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-900 mb-1">Email Verification</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Checking your Institutional Inbox
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-3 bg-red-50 text-red-700 text-[9px] rounded-xl border border-red-100 font-bold flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-[9px] rounded-xl border border-emerald-100 font-bold flex items-center gap-3"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {success}
        </motion.div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 font-sans text-center block">
            Enter 6-Digit Code
          </label>
          <input 
            type="text" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            className="w-full text-center px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-950 font-black text-xl tracking-[0.4em] placeholder:text-slate-200" 
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full py-4 bg-slate-950 hover:bg-black text-white font-bold text-xs uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? 'Verifying...' : 'Authenticate'}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 text-center pt-6 border-t border-slate-50">
        <button
          onClick={handleResend}
          disabled={resending}
          className="group flex items-center justify-center gap-2 mx-auto text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {resending ? 'Resending...' : 'Resend Code'}
        </button>
        
        <p className="mt-4 text-[8px] text-slate-400 font-medium">
          Verifying <span className="text-slate-600 font-bold">{user.email}</span>
        </p>

        <p className="mt-4 p-2.5 bg-amber-50 text-amber-700 text-[8px] font-bold rounded-lg border border-amber-100 flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" />
          DEV MODE: Check backend/otp_logs.txt for the OTP.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
