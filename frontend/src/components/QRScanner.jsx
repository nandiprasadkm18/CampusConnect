import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Clipboard, ExternalLink, RefreshCcw, ChevronDown, Check, Info, Users, MapPin, Calendar } from 'lucide-react';

const QRScanner = ({ type = 'events' }) => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch items for selection
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo) return;
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const endpoint = `http://localhost:5000/api/${type}`;
        const { data } = await axios.get(endpoint, config);
        const list = type === 'events' ? data.events : data.workshops;
        setItems(list || []);
      } catch (err) {
        console.error("Failed to fetch selection items", err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
    setSelectedItem(null);
    setIsGenerated(false);
  }, [type]);

  const handleGenerate = () => {
    if (selectedItem) setIsGenerated(true);
  };

  const handleReset = () => {
    setIsGenerated(false);
  };

  const attendanceUrl = selectedItem 
    ? `${window.location.origin}/attendance/${type}/${selectedItem._id}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {!isGenerated ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 text-center space-y-10"
          >
            <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-4xl font-serif font-extrabold text-slate-950 tracking-tight">Attendance Gateway</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                Select a session to generate a secure entry token for your students.
              </p>
            </div>

            <div className="space-y-6 text-left max-w-lg mx-auto">
              <div className="space-y-2 px-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Session Selection</label>
                <div className="relative group">
                  <select 
                    value={selectedItem?._id || ''}
                    onChange={(e) => {
                      const item = items.find(i => i._id === e.target.value);
                      setSelectedItem(item);
                    }}
                    className="w-full pl-6 pr-14 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] appearance-none font-serif text-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer hover:bg-slate-100"
                  >
                    <option value="">Choose {type === 'events' ? 'Event' : 'Workshop'}...</option>
                    {items.map(item => (
                      <option key={item._id} value={item._id}>{item.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>

              {selectedItem && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="bg-indigo-50/50 border border-indigo-100/50 rounded-[2rem] p-6 space-y-4"
                 >
                   <div className="flex items-start gap-4">
                     <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                       <Info className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">Session Details</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                             <MapPin className="w-3 h-3" /> {selectedItem.location || 'TBA'}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                             <Calendar className="w-3 h-3" /> {new Date(selectedItem.date).toLocaleDateString()}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                             <Users className="w-3 h-3" /> {selectedItem.attendees?.length || 0} Registered
                           </div>
                        </div>
                     </div>
                   </div>
                 </motion.div>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!selectedItem || loadingItems}
              className="group w-full max-w-lg py-7 bg-slate-950 text-white font-bold text-sm uppercase tracking-[0.4em] rounded-[2.5rem] transition-all hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-4 mx-auto"
            >
              {loadingItems ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                 <>Launch Presence Token <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
              )}
            </button>

            <div className="pt-4 flex items-center justify-center gap-6 opacity-40">
               <div className="h-px w-12 bg-slate-200" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Encrypted via AES-256</span>
               <div className="h-px w-12 bg-slate-200" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-2 gap-8 items-stretch"
          >
            {/* Left Column: QR Code */}
            <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-2xl flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
               
               <div className="relative p-8 bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 border-4 border-slate-50">
                  <QRCodeSVG 
                    value={attendanceUrl} 
                    size={280}
                    level="M"
                    includeMargin={false}
                  />

               </div>

               <div className="space-y-4">
                  <h4 className="text-2xl font-serif font-extrabold text-slate-950 uppercase tracking-tighter">Scan to confirm</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Students must scan using their personal mobile devices to mark attendance.
                  </p>
               </div>
            </div>

            {/* Right Column: Info & Actions */}
            <div className="space-y-6 flex flex-col justify-center">
               <div className="bg-slate-950 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Users className="w-20 h-20" />
                  </div>
                  
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Currently Broadcasting</span>
                     <h2 className="text-3xl font-serif font-extrabold leading-tight">{selectedItem.title}</h2>
                  </div>

                  <div className="pt-6 border-t border-slate-800 space-y-4">
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Gateway Link</label>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex-1 bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800 font-mono text-xs text-slate-400 truncate">
                              {attendanceUrl}
                           </div>
                           <button 
                             onClick={copyToClipboard}
                             className={`p-4 rounded-2xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                           >
                              {copied ? <Check className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                     <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <motion.div 
                          className="h-full bg-indigo-500" 
                          initial={{ width: 0 }} 
                          animate={{ width: '100%' }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        />
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 font-mono">LIVE</span>
                  </div>
               </div>

               <button 
                 onClick={handleReset}
                 className="w-full py-6 bg-white text-slate-400 font-bold text-xs uppercase tracking-widest rounded-[2rem] border-2 border-slate-100 hover:border-red-100 hover:text-red-500 hover:bg-red-50/50 transition-all flex items-center justify-center gap-3"
               >
                  <RefreshCcw className="w-4 h-4" /> Reset Portal Control
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRScanner;
