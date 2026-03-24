import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, User, Hash, ArrowRight, Calendar, MapPin, Sparkles } from 'lucide-react';

const AttendanceLogPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/${type}/${id}/public`);
        setSession(data);
      } catch (err) {
        setStatus('error');
        setMessage('Invalid or expired attendance link.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    // Auto-fill from local user if exists
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setName(parsed.profile?.fullName || parsed.username || '');
      setUsn(parsed.profile?.usn || '');
    }
  }, [type, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !usn) return;

    setStatus('submitting');
    try {
      const { data } = await axios.post(`http://localhost:5000/api/${type}/${id}/self-mark`, { name, usn });
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to mark attendance.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative z-10"
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                 <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-serif font-extrabold text-slate-950">Presence Confirmed</h2>
                 <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-5 bg-slate-950 text-white font-bold text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all"
              >
                Return to Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }}>
              {/* Header Info */}
              <div className="bg-slate-950 p-10 text-white space-y-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Live Attendance Gateway</span>
                 </div>
                 <h1 className="text-3xl font-serif font-extrabold leading-tight">{session?.title}</h1>
                 <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <MapPin className="w-3 h-3" /> {session?.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <Calendar className="w-3 h-3" /> {new Date(session?.date).toLocaleDateString()}
                    </div>
                 </div>
              </div>

              {/* Form Section */}
              <div className="p-10 space-y-8">
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold"
                  >
                    <XCircle className="w-5 h-5 flex-shrink-0" /> {message}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Satya Nadella"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">University Serial Number (USN)</label>
                    <div className="relative group">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. 1RV21IS000"
                        value={usn}
                        onChange={(e) => setUsn(e.target.value.toUpperCase())}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all font-mono text-sm tracking-widest text-slate-900 placeholder:text-slate-300 uppercase"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'submitting' || !name || !usn}
                    className="group w-full py-6 bg-slate-950 text-white font-bold text-xs uppercase tracking-[0.4em] rounded-[1.5rem] transition-all hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                  >
                    {status === 'submitting' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                       <>Confirm Attendance <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                <p className="text-[9px] text-center text-slate-400 font-medium leading-relaxed">
                  By confirming, you agree that your attendance data will be logged securely within the CampusConnect university repository.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Visual background element */}
      <div className="absolute bottom-20 right-20 opacity-10">
         <Sparkles className="w-32 h-32 text-indigo-600" />
      </div>
    </div>
  );
};

export default AttendanceLogPage;
