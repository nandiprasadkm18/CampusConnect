import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ShieldCheck, GraduationCap, Calendar, BookOpen, Fingerprint, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL_GET = `${API_BASE_URL}/api/users/profile`;

const VerificationBadge = ({ verified, onVerify, type }) => {
  const navigate = useNavigate();
  if (verified) {
    return (
      <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
      </div>
    );
  }
  return (
    <button 
      onClick={() => navigate(`/verify-otp?type=${type}`)}
      className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 hover:bg-amber-500 hover:text-white transition-all"
    >
      <AlertCircle className="w-2.5 h-2.5" /> Verify Now
    </button>
  );
};

const ProfileItem = ({ icon: Icon, label, value, delay, verified, type }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
  >
    <div className="p-3 rounded-xl bg-white text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        {type && <VerificationBadge verified={verified} type={type} />}
      </div>
      <p className="text-base font-serif font-bold text-slate-950 tracking-tight">{value || 'Not set'}</p>
    </div>
  </motion.div>
);

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const { data } = await axios.get(API_URL_GET, config);
        setProfile(data);
      } catch (error) {
        setError('Failed to load profile synchronization');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 animate-pulse">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Identity Hub...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 rounded-[2rem] bg-red-50/50 border border-red-100 text-red-700 font-bold text-center max-w-md mx-auto my-12 backdrop-blur-sm">
      {error}
    </div>
  );

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <div className="inline-flex p-4 rounded-[2rem] bg-indigo-50 text-indigo-600 mb-6 shadow-inner">
          <Fingerprint className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-serif font-extrabold text-slate-950 tracking-tight mb-3">Institutional Identity</h2>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-[0.2em] opacity-80">Official academic credentials and profile data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileItem icon={User} label="Academic Username" value={profile.username} delay={0.1} />
        <ProfileItem 
          icon={Mail} 
          label="Institutional Email" 
          value={profile.email} 
          delay={0.2} 
          type="email" 
          verified={profile.isEmailVerified} 
        />
        <ProfileItem 
          icon={Phone} 
          label="Phone Number" 
          value={profile?.profile?.phoneNumber} 
          delay={0.25} 
        />
        <ProfileItem icon={ShieldCheck} label="University Serial Number (USN)" value={profile?.profile?.usn} delay={0.3} />
        <ProfileItem icon={GraduationCap} label="Department / Branch" value={profile?.profile?.branch?.toUpperCase()} delay={0.4} />
        <ProfileItem icon={Calendar} label="Commencement Year" value={profile?.profile?.year} delay={0.5} />
        <ProfileItem icon={BookOpen} label="Current Semester" value={profile?.profile?.semester} delay={0.6} />
      </div>

      <div className="mt-16 p-8 bg-slate-950 rounded-[2.5rem] text-center shadow-2xl shadow-indigo-500/10">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
          Account Status: 
          {profile.isEmailVerified ? (
            <span className="text-emerald-400 pl-2">Sync Verified</span>
          ) : (
            <span className="text-amber-400 pl-2">Sync Pending</span>
          )}
        </p>
        <p className="text-white/60 text-xs font-medium">
          {profile.isEmailVerified 
            ? "Your account is fully synced and verified with the university database."
            : "Please verify your institutional email to complete synchronization."}
        </p>
      </div>
    </div>
  );
};

export default MyProfile;