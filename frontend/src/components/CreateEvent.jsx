import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Type, AlignLeft, Calendar, MapPin, GraduationCap, PlusCircle, CheckCircle, Users, Image } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/events';

const branches = [
  { key: 'cse', name: 'Computer Science (CSE)' },
  { key: 'ise', name: 'Information Science (ISE)' },
  { key: 'aiml', name: 'CS - AI/ML' },
  { key: 'ec', name: 'Electronics (EC)' },
  { key: 'eee', name: 'Electrical (EEE)' },
  { key: 'civil', name: 'Civil' },
  { key: 'mechanical', name: 'Mechanical' },
  { key: 'general', name: 'General / All-College' }
];

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [branch, setBranch] = useState('general');
  const [category, setCategory] = useState('technical');
  const [capacity, setCapacity] = useState(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [maxGroupSize, setMaxGroupSize] = useState(1);
  const [banner, setBanner] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [fee, setFee] = useState(0);
  const [paymentQR, setPaymentQR] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const today = new Date().toLocaleDateString('en-CA');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        setError('Authorization required to schedule events.');
        return;
      }
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('branch', branch);
      formData.append('category', category);
      formData.append('capacity', isUnlimited ? 0 : Number(capacity));
      formData.append('maxGroupSize', Number(maxGroupSize));
      formData.append('isPaid', isPaid);
      formData.append('fee', fee);
      formData.append('whatsappLink', whatsappLink);
      
      if (banner) formData.append('banner', banner);
      if (paymentQR) formData.append('paymentQR', paymentQR);
      
      await axios.post(API_URL, formData, config);
      setSuccess('Event has been successfully scheduled on the campus calendar.');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setBranch('general');
      setCategory('technical');
      setCapacity(100);
      setIsUnlimited(false);
      setMaxGroupSize(1);
      setBanner(null);
      setIsPaid(false);
      setFee(0);
      setPaymentQR(null);
      setWhatsappLink('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans bg-[#f8fafc]/50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        {/* SaaS Header */}
        <div className="bg-[#0f172a] pt-12 pb-10 px-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
          <div className="inline-flex p-4 rounded-full bg-white/5 mb-6 ring-1 ring-white/10 shadow-inner">
            <PlusCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white font-serif mb-3 tracking-tight">Schedule University Event</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] opacity-80">Administrative Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-5 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-medium flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-emerald-50 text-emerald-700 text-sm rounded-2xl border border-emerald-100 font-medium flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              {success}
            </motion.div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
            {/* Title */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <Type className="w-3.5 h-3.5" /> Event Title
              </label>
              <input 
                className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none text-base"
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Annual Tech Symposium"
                required 
              />
            </div>

            {/* Branch */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <GraduationCap className="w-3.5 h-3.5" /> Academic Branch
              </label>
              <div className="relative">
                <select 
                  className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none appearance-none cursor-pointer text-base"
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  required
                >
                  {branches.map(b => (
                    <option key={b.key} value={b.key}>{b.name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <PlusCircle className="w-4 h-4 rotate-45" />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <PlusCircle className="w-3.5 h-3.5 text-indigo-500" /> Event Category
              </label>
              <div className="relative">
                <select 
                  className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none appearance-none cursor-pointer text-base"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required
                >
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="seminar">Academic/Seminar</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <PlusCircle className="w-4 h-4 rotate-45" />
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <Users className="w-3.5 h-3.5" /> Seat Availability
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <input 
                    className={`w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none ${isUnlimited ? 'opacity-30 cursor-not-allowed' : ''} text-base`}
                    type="number" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                    placeholder="100"
                    disabled={isUnlimited}
                    min="1"
                  />
                </div>
                <label className="flex-shrink-0 flex items-center gap-2.5 cursor-pointer group bg-slate-50 px-4 py-4.5 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={isUnlimited} 
                    onChange={(e) => setIsUnlimited(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-[#0f172a] focus:ring-[#0f172a] cursor-pointer" 
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">No Limit</span>
                </label>
              </div>
            </div>

            {/* Squad Size */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                  <Users className="w-3.5 h-3.5" /> Max Squad Size
                </label>
                <input 
                  className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-base"
                  type="number" 
                  value={maxGroupSize} 
                  onChange={(e) => setMaxGroupSize(e.target.value)} 
                  min="1"
                  required 
                />
                <p className="text-[10px] text-slate-400 font-bold pl-1 italic">Enter 1 for individual entries.</p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Group Link (Optional)
              </label>
              <input 
                className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-950 font-bold focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all outline-none placeholder:text-slate-300 text-base"
                type="url" 
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)} 
                placeholder="https://chat.whatsapp.com/..."
              />
               <p className="text-[10px] text-slate-400 font-bold pl-1">Students will see this link after successful registration.</p>
            </div>

            {/* Narrative - Full Width */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <AlignLeft className="w-3.5 h-3.5" /> Event Narrative
              </label>
              <textarea 
                className="w-full px-6 py-5 bg-[#f8fafc] border border-slate-200 rounded-[2rem] text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none resize-none h-44 text-base leading-relaxed" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Provide a comprehensive description of the event..."
                required 
              />
            </div>

            {/* Date */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5" /> Date of Session
              </label>
              <input 
                className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none cursor-pointer text-base"
                type="date" 
                value={date} 
                min={today}
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5" /> Campus Location
              </label>
              <input 
                className="w-full px-6 py-4.5 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-base"
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., Auditorium Hall A"
                required 
              />
            </div>

            {/* Banner */}
            <div className="space-y-4 md:col-span-2 group">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <Image className="w-3.5 h-3.5" /> Event Banner (Optional)
              </label>
              <div className="relative h-20 bg-[#f8fafc] border-2 border-dashed border-slate-200 rounded-2xl transition-all hover:border-indigo-400 hover:bg-slate-100/50 overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="banner-upload"
                />
                <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
                    <span className="text-sm font-bold text-slate-500 truncate max-w-[70%]">
                      {banner ? banner.name : 'Choose File'}
                    </span>
                    <span className="bg-[#0f172a] text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-lg transition-transform group-hover:scale-105">
                      {banner ? 'Change' : 'Upload'}
                    </span>
                </div>
              </div>
              {banner && (
                <p className="text-[10px] font-black text-indigo-600 flex items-center gap-1.5 animate-pulse pl-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Selection Active: {banner.name}
                </p>
              )}
            </div>

            {/* Paid Toggle */}
            <div className="space-y-6 md:col-span-2 p-10 bg-[#f8fafc] border border-slate-100 rounded-[2.5rem] shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl border ${isPaid ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}`}>
                        <CheckCircle className={`w-5 h-5 ${isPaid ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Paid Event Required?</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Toggle for gateway integration</p>
                    </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`w-16 h-8 rounded-full p-1.5 transition-all duration-500 shadow-lg ${isPaid ? 'bg-[#0f172a]' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-500 transform ${isPaid ? 'translate-x-8 shadow-indigo-500/50' : 'translate-x-0'}`} />
                </button>
              </div>

              {isPaid && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 pt-8 border-t border-slate-200/60"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Registration Fee (₹)</label>
                    <input 
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-base"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Verification QR Code</label>
                    <div className="relative h-16 bg-white border border-slate-200 rounded-2xl transition-all overflow-hidden">
                        <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setPaymentQR(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="qr-upload"
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[80%]">
                              {paymentQR ? paymentQR.name : 'Select QR Image'}
                            </span>
                            <PlusCircle className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    {paymentQR && (
                      <p className="text-[10px] font-black text-emerald-600 pl-1 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> System Linked: {paymentQR.name}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-6 bg-[#0f172a] hover:bg-black text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] transition-all shadow-2xl shadow-indigo-500/10 disabled:opacity-50 mt-10 active:scale-[0.97] border border-white/5"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Syncing Cloud...</span>
              </div>
            ) : 'Confirm Schedule'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateEvent;