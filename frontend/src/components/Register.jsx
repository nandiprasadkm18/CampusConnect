import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, GraduationCap, Calendar, BookOpen, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';
const branches = ['cse', 'ise', 'aiml', 'ec', 'eee', 'civil', 'mechanical'];
const years = ['1', '2', '3', '4'];
const semesterMap = {
  '1': ['1', '2'],
  '2': ['3', '4'],
  '3': ['5', '6'],
  '4': ['7', '8'],
};

const Register = () => {
  const [userType, setUserType] = useState('student'); // 'student' or 'admin'
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
    usn: '', branch: '', year: '', semester: '',
    secretCode: '' // New for admin
  });
  
  const [availableSemesters, setAvailableSemesters] = useState([]); 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formData.year) {
      setAvailableSemesters(semesterMap[formData.year]);
      setFormData(prev => ({ ...prev, semester: '' })); 
    }
  }, [formData.year]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'usn' ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        role: userType // Pass the selected role
      };
      await axios.post(`${API_URL}/register`, payload);
      setSuccess(`${userType === 'admin' ? 'Administrative' : 'Student'} identity established!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Synchronization failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto p-10 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-extrabold text-slate-950 mb-3 tracking-tight">Profile Synced</h2>
        <p className="text-slate-400 font-medium text-xs mb-8 opacity-80 leading-relaxed">{success}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="w-full py-4.5 bg-slate-950 text-white font-bold text-xs uppercase tracking-[0.3em] rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-0">
      <div className="mb-6 flex p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setUserType('student')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${userType === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Student
        </button>
        <button
          onClick={() => setUserType('admin')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${userType === 'admin' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Admin
        </button>
      </div>

      <div className="mb-4 text-center">
        <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight mb-1.5">
          {userType === 'admin' ? 'Admin Credentialing' : 'Enter your details'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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

        {userType === 'student' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2 font-sans">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-slate-950 font-bold text-xs" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2 font-sans">
                  <ShieldCheck className="w-3 h-3" /> USN
                </label>
                <input name="usn" type="text" value={formData.usn} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-slate-950 font-bold text-xs" placeholder="1AB21" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-sans">Branch</label>
                <select name="branch" value={formData.branch} onChange={handleChange} required className="w-full px-3 h-11 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-950 font-bold text-xs">
                  <option value="">...</option>
                  {branches.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-sans">Year</label>
                <select name="year" value={formData.year} onChange={handleChange} required className="w-full px-3 h-11 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-950 font-bold text-xs">
                  <option value="">...</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-sans">Sem</label>
                <select name="semester" value={formData.semester} onChange={handleChange} required disabled={!formData.year} className="w-full px-3 h-11 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-950 font-bold text-xs">
                  <option value="">...</option>
                  {availableSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2 font-sans">
            <Mail className="w-3 h-3" /> {userType === 'admin' ? 'Admin Email' : 'Institutional Email'}
          </label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-slate-950 font-bold text-xs" placeholder="admin@campus.edu" />
        </div>

        {userType === 'admin' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2 font-sans">
              <ShieldCheck className="w-3 h-3 text-indigo-500" /> Admin Secret Code
            </label>
            <input 
              name="secretCode" 
              type="password" 
              value={formData.secretCode} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-indigo-100 rounded-xl focus:bg-white outline-none transition-all text-slate-950 font-bold text-xs placeholder:text-slate-300" 
              placeholder="Enter Administrative Code" 
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2 font-sans">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-slate-950 font-bold text-xs" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2 font-sans">
              <Lock className="w-3 h-3" /> Confirm
            </label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-slate-950 font-bold text-xs" placeholder="••••••••" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`group max-w-xs mx-auto w-full py-3.5 ${userType === 'admin' ? 'bg-indigo-600 hover:bg-slate-900' : 'bg-slate-950 hover:bg-black'} text-white font-bold text-xs uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center active:scale-[0.98] mt-4`}
        >
          {isLoading ? 'Processing...' : 'Establish Identity'}
        </button>
      </form>
    </div>
  );
};

export default Register;