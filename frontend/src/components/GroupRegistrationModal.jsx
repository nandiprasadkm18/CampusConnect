import API_BASE_URL from '../config/api.js';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, UserMinus, ShieldCheck, User, CheckCircle, AlertCircle, Loader2, CreditCard, Image as ImageIcon, Check } from 'lucide-react';
import axios from 'axios';

const GroupRegistrationModal = ({ isOpen, onClose, event, userInfo, onRegisterSuccess, type = 'events' }) => {
  const [regType, setRegType] = useState('individual'); // 'individual' or 'group'
  const [groupMembers, setGroupMembers] = useState([]);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!event) return null;

  const maxMembers = (event.maxGroupSize || 1) - 1;

  const addMember = () => {
    if (groupMembers.length < maxMembers) {
      setGroupMembers([...groupMembers, { fullName: '', usn: '' }]);
    }
  };

  const removeMember = (index) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...groupMembers];
    newMembers[index][field] = field === 'usn' ? value.toUpperCase() : value;
    setGroupMembers(newMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (regType === 'group') {
      const invalid = groupMembers.some(m => !m.fullName || !m.usn);
      if (invalid) {
        setError('Please fill in all member details.');
        setLoading(false);
        return;
      }
    }

    if (event.isPaid && !paymentScreenshot) {
      setError('Please upload the payment screenshot to proceed.');
      setLoading(false);
      return;
    }

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const formData = new FormData();
      formData.append('groupMembers', JSON.stringify(regType === 'group' ? groupMembers : []));
      if (paymentScreenshot) {
        formData.append('paymentScreenshot', paymentScreenshot);
      }

      await axios.post(`${API_BASE_URL}/api/${type}/${event._id}/register`, formData, config);
      setIsSuccess(true);
      onRegisterSuccess(event._id, type);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-indigo-600">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Seat Reservation</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-950">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-950">{event.title}</h2>
              {event.isPaid && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Fee Required: ₹{event.fee}</span>
                </div>
              )}
            </div>

            {isSuccess ? (
              <div className="p-12 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-500/10">
                   <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-black text-slate-950 mb-3">Registration Confirmed!</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                    {event.isPaid 
                      ? "Your payment screenshot is under review. You'll be notified once verified."
                      : "You've successfully secured your spot for this session."}
                  </p>
                </div>

                {event.whatsappLink && (
                  <div className="w-full p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col items-center space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg text-white">
                           <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest pl-1">Join the community</span>
                     </div>
                     <a 
                       href={event.whatsappLink}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center gap-3"
                     >
                       Join WhatsApp Group
                     </a>
                     <p className="text-[9px] text-emerald-600 font-bold italic tracking-wider uppercase pl-1">Link will stay active on your card</p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-5 bg-slate-950 hover:bg-black text-white font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-slate-200"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <>
                <form id="regForm" onSubmit={handleSubmit} className="p-8 pb-20 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Payment Proof Section - Only for Paid Events */}
                  {event.isPaid && (
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-600 rounded-xl">
                             <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                             <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest">Payment Proof Required</h3>
                             <p className="text-[10px] text-slate-400 font-medium mt-0.5">Scan the QR and upload screenshot</p>
                          </div>
                       </div>

                        {event.paymentQR && (
                          <div className="bg-slate-950 -mx-8 py-10 flex flex-col items-center shadow-inner">
                             <div className="relative group">
                               <img 
                                 src={event.paymentQR} 
                                 alt="Payment QR" 
                                 className="relative w-auto h-auto max-w-[280px] md:max-w-[350px] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4 border-white/10" 
                               />
                             </div>
                          </div>
                        )}

                       <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Transaction Screenshot</label>
                          <div className="relative group">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-400 text-[10px] font-bold file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-bold file:bg-slate-950 file:text-white transition-all cursor-pointer hover:border-indigo-200"
                            />
                            {paymentScreenshot && (
                              <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-100">
                                 <CheckCircle className="w-3 h-3" />
                                 <span>Proof: {paymentScreenshot.name} selected</span>
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                  )}

                  {event.maxGroupSize > 1 && (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration Style</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setRegType('individual')}
                          className={`p-6 rounded-3xl border-2 transition-all text-left ${
                            regType === 'individual' 
                              ? 'border-indigo-600 bg-indigo-50/30' 
                              : 'border-slate-100 hover:border-indigo-200'
                          }`}
                        >
                          <User className={`w-6 h-6 mb-3 ${regType === 'individual' ? 'text-indigo-600' : 'text-slate-300'}`} />
                          <p className="text-sm font-bold text-slate-950 mb-1">Solo</p>
                          <p className="text-[10px] text-slate-400 font-medium">Just for me</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegType('group')}
                          className={`p-6 rounded-3xl border-2 transition-all text-left ${
                            regType === 'group' 
                              ? 'border-indigo-600 bg-indigo-50/30' 
                              : 'border-slate-100 hover:border-indigo-200'
                          }`}
                        >
                          <Users className={`w-6 h-6 mb-3 ${regType === 'group' ? 'text-indigo-600' : 'text-slate-300'}`} />
                          <p className="text-sm font-bold text-slate-950 mb-1">Squad</p>
                          <p className="text-[10px] text-slate-400 font-medium">Add teammates</p>
                        </button>
                      </div>

                      {regType === 'group' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Co-Participants</h3>
                            <button 
                              type="button"
                              onClick={addMember}
                              disabled={groupMembers.length >= maxMembers}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-30 flex items-center gap-1.5 transition-all"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Add Member
                            </button>
                          </div>

                          {groupMembers.length === 0 && (
                            <div className="py-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                              <Users className="w-8 h-8 mb-3 opacity-20" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">No members added yet</p>
                            </div>
                          )}

                          {groupMembers.map((member, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 relative group"
                            >
                              <button 
                                type="button"
                                onClick={() => removeMember(index)}
                                className="absolute top-4 right-4 p-1.5 bg-white text-slate-300 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                  <input 
                                    type="text"
                                    value={member.fullName}
                                    onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-950 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    placeholder="Student Name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">USN Code</label>
                                  <input 
                                    type="text"
                                    value={member.usn}
                                    onChange={(e) => updateMember(index, 'usn', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-950 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    placeholder="1ABXX..."
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </form>

                <div className="p-8 bg-white border-t border-slate-50 flex items-center justify-between gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-950 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    form="regForm"
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-slate-950 hover:bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GroupRegistrationModal;
