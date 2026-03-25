import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, User, CheckCircle, ExternalLink, Users, ChevronLeft, Clock } from 'lucide-react';
import AttendeeListModal from './AttendeeListModal.jsx';

const API_URL = `${API_BASE_URL}/api/events/branch`;

const BranchEventsList = ({ branchName }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [registerStatus, setRegisterStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchBranchEvents = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('Authentication required for branch archives.');
        setLoading(false);
        return;
      }

      setUserInfo(storedUser);
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(`${API_URL}/${branchName}`, config);
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Branch data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (registerStatus[eventId]) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, {}, config);
      setRegisterStatus((prev) => ({ ...prev, [eventId]: 'Success!' }));
      fetchBranchEvents();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed';
      setRegisterStatus((prev) => ({ ...prev, [eventId]: message }));
    }
  };

  useEffect(() => {
    fetchBranchEvents();
  }, [branchName]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-serif font-medium uppercase tracking-widest text-sm">Synchronizing {branchName} archives...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-serif font-medium text-center max-w-lg mx-auto my-12">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-serif">
      <div className="mb-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-[0.2em] mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Return to Portal
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">{branchName} Archives</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg border-l-4 border-slate-900 pl-4">Exploring academic engagements for the {branchName} department.</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-full border border-slate-200 text-slate-950 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>{events.length} Departmental Records</span>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-200">
           <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-5" />
           <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">No Records Found</p>
           <p className="text-slate-400 mt-2">The {branchName} department has no active events at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {events.map((event, index) => {
              const isRegistered = event.attendees.some((a) => (a.user?._id || a.user) === userInfo?._id);
              const status = registerStatus[event._id];

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={event._id}
                  className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col"
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      {userInfo?.role === 'admin' && (
                        <button 
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }}
                          className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300"
                        >
                          <Calendar className="w-6 h-6" />
                        </button>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 ml-auto">
                        <div className={`w-2 h-2 rounded-full ${isRegistered ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRegistered ? 'ENROLLED' : 'OPEN'}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-6 uppercase tracking-tight group-hover:text-black transition-colors min-h-[3rem]">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-sm line-clamp-3 mb-8 border-t border-slate-50 pt-6">
                      {event.description}
                    </p>
                  </div>

                  <div className="p-8 pt-0 mt-auto">
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {event.attendees.length} ENROLLED
                      </div>
                      
                      {userInfo && userInfo.role === 'user' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRegister(event._id)}
                          disabled={isRegistered || !!status}
                          className={`px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 border-2 ${
                            isRegistered || status
                              ? 'bg-slate-50 text-slate-400 border-slate-100'
                              : 'border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white shadow-sm hover:shadow-lg'
                          }`}
                        >
                          {isRegistered ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <span>{status || 'Register'}</span>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AttendeeListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        attendees={selectedEvent?.attendees} 
        sessionTitle={selectedEvent?.title} 
      />
    </div>
  );
};

export default BranchEventsList;
