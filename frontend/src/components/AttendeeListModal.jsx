import API_BASE_URL from '../config/api.js';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Hash, CheckCircle, Info, Users, Clock, ChevronDown, ChevronUp, UserPlus, Eye, AlertCircle, XCircle, Check, Star, MessageSquare } from 'lucide-react';

import axios from 'axios';

const AttendeeListModal = ({ isOpen, onClose, attendees = [], feedback = [], sessionTitle, sessionId, type, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('attendees');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [processing, setProcessing] = useState(null);

  if (!isOpen) return null;

  const handleApprove = async (attendeeId) => {
    if (!window.confirm("Approve this payment and confirm the student's spot?")) return;
    setProcessing(attendeeId);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${API_BASE_URL}/api/${type}/${sessionId}/attendees/${attendeeId}/verify-payment`, {}, config);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(null);
    }
  };

  // Grouping logic: Create a map of groups
  const groups = attendees.reduce((acc, attendee) => {
    if (attendee.groupId) {
      if (!acc[attendee.groupId]) {
        acc[attendee.groupId] = { leader: null, members: [] };
      }
      if (attendee.isGroupLeader) {
        acc[attendee.groupId].leader = attendee;
      } else {
        acc[attendee.groupId].members.push(attendee);
      }
    }
    return acc;
  }, {});

  // Identify individuals (those without a groupId)
  const individuals = attendees.filter(a => !a.groupId);

  // Combine for rendering: standard individuals + group leaders
  const displayItems = [
    ...individuals,
    ...Object.values(groups).map(g => g.leader).filter(Boolean)
  ].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase border border-emerald-100 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-2.5 h-2.5" /> Verified</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase border border-amber-100 bg-amber-50 px-2 py-0.5 rounded-full"><AlertCircle className="w-2.5 h-2.5" /> Pending</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-[8px] font-black text-red-600 uppercase border border-red-100 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-2.5 h-2.5" /> Rejected</span>;
      default:
        return null;
    }
  };

  const renderAttendeeCard = (attendee, isMember = false, isLeader = false) => {
    const name = attendee.fullName || attendee.user?.profile?.fullName || attendee.user?.username || 'Unknown Student';
    const usn = attendee.usn || attendee.user?.profile?.usn || 'N/A';
    const isManual = !!attendee.manualEntry;
    const isAttended = !!attendee.attended;
    const groupId = attendee.groupId;
    const hasMembers = groupId && groups[groupId]?.members.length > 0;
    const isExpanded = expandedGroups[groupId];

    return (
      <div key={attendee._id || attendee.usn} className="space-y-2">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center justify-between p-5 transition-all group ${
            isMember 
              ? 'bg-white border-l-4 border-l-indigo-500 rounded-r-3xl border-y border-r border-slate-100 ml-8 py-3' 
              : 'bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'
          }`}
          onClick={() => isLeader && hasMembers && toggleGroup(groupId)}
          style={{ cursor: isLeader && hasMembers ? 'pointer' : 'default' }}
        >
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl flex items-center justify-center transition-all ${
              isMember ? 'w-10 h-10' : 'w-12 h-12'
            } ${
              isAttended 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-white text-slate-400 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
            }`}>
              {isMember ? <UserPlus className="w-4 h-4" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-bold text-slate-900 ${isMember ? 'text-sm' : 'text-base'}`}>{name}</h4>
                {isLeader && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest">Team Leader</span>
                )}
                {isMember && attendee.invitationStatus === 'pending' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest">Pending Invite</span>
                )}
                {isMember && attendee.invitationStatus === 'accepted' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest">Joined Team</span>
                )}
                {getStatusBadge(attendee.paymentStatus)}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase font-bold">
                  <Hash className="w-3 h-3" /> {usn}
                </span>
                {!isMember && (
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${
                    isManual ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {isManual ? 'Manual Scan' : 'System Member'}
                  </span>
                )}
                {attendee.paymentScreenshot && (
                  <div className="flex items-center gap-2">
                    <a 
                      href={attendee.paymentScreenshot} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[8px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all uppercase tracking-widest"
                    >
                      <Eye className="w-2.5 h-2.5" /> View Payment
                    </a>
                    
                    {attendee.paymentStatus === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(attendee._id);
                        }}
                        disabled={processing === attendee._id}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-bold hover:bg-emerald-700 transition-all uppercase tracking-widest disabled:opacity-50"
                      >
                        {processing === attendee._id ? '...' : <Check className="w-2.5 h-2.5" />}
                        {processing === attendee._id ? 'Processing' : 'Approve Payment'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              {isAttended ? (
                <>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Present</span>
                  </div>
                  {attendee.attendedAt && (
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 flex items-center gap-1">
                      <Clock className="w-2 h-2" /> {new Date(attendee.attendedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Pending</span>
              )}
            </div>
            {isLeader && hasMembers && (
              <div className="pl-4 border-l border-slate-100 text-slate-300 group-hover:text-indigo-600 transition-colors">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            )}
          </div>
        </motion.div>

        {/* Render Members if expanded */}
        {isLeader && isExpanded && groups[groupId].members.map(member => renderAttendeeCard(member, true))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-950 p-8 md:p-10 text-white relative shrink-0">
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Engagement Roster</span>
              </div>
              <h2 className="text-3xl font-serif font-extrabold leading-tight pr-12">{sessionTitle}</h2>
              
              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
                   <button 
                     onClick={() => setActiveTab('attendees')}
                     className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                       activeTab === 'attendees' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/60 hover:text-white'
                     }`}
                   >
                     Attendees ({attendees.length})
                   </button>
                   <button 
                     onClick={() => setActiveTab('feedback')}
                     className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                       activeTab === 'feedback' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/60 hover:text-white'
                     }`}
                   >
                     Feedback ({feedback.length})
                   </button>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Deployment Sync: <span className="text-white">{Object.keys(groups).length} Groups</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
            {activeTab === 'attendees' ? (
              attendees.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <Info className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-slate-500 font-serif font-bold text-xl">No one has registered yet</p>
                  <p className="text-slate-400 text-sm">Attendance data will populate here as students scan or join.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                   {displayItems.map((item) => renderAttendeeCard(item, false, !!item.groupId))}
                </div>
              )
            ) : (
              /* Feedback View */
              <div className="space-y-8">
                {feedback.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-500 font-serif font-bold text-xl">No feedback received</p>
                    <p className="text-slate-400 text-sm">Student reviews will appear here once the feedback form is opened.</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 bg-slate-950 rounded-[2rem] text-white flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4">Average Rating</span>
                        <div className="text-5xl font-serif font-black mb-2">
                          {(feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)}
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= Math.round(feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-8 bg-indigo-600 rounded-[2rem] text-white flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.3em] mb-4">Net Responses</span>
                        <div className="text-5xl font-serif font-black mb-2">{feedback.length}</div>
                        <p className="text-[10px] font-bold text-indigo-200/60 uppercase tracking-widest">Captured Submissions</p>
                      </div>
                    </div>

                    {/* Individual Feedback List */}
                    <div className="space-y-4 pt-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">Student Observations</h4>
                      {feedback.map((item, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                                {(item.user?.profile?.fullName || item.user?.username || '?')[0]}
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-950">{item.user?.profile?.fullName || item.user?.username || 'Anonymous Student'}</h5>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`w-2.5 h-2.5 ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed italic pr-4">
                            "{item.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Secure University Repository
             </div>
             <button 
               onClick={onClose}
               className="px-8 py-3 bg-slate-950 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all"
             >
                Close View
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AttendeeListModal;

