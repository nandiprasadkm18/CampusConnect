import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, User, Trash2, CheckCircle, ExternalLink, Users, CreditCard } from 'lucide-react';
import AttendeeListModal from './AttendeeListModal.jsx';
import GroupRegistrationModal from './GroupRegistrationModal.jsx';
import Skeleton from './ui/Skeleton.jsx';

const API_URL = `${API_BASE_URL}/api/events`;

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [registerStatus, setRegisterStatus] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupEvent, setSelectedGroupEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('You must be logged in to see events.');
        setLoading(false);
        return;
      }
      setUserInfo(storedUser);

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(`${API_URL}?page=${page}&limit=6`, config);
      setEvents(data.events);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (registerStatus[eventId]) return;
    
    const event = events.find(e => e._id === eventId);
    // Open modal if it's a paid event OR if it supports groups
    if (event && (event.isPaid || event.maxGroupSize > 1)) {
      setSelectedGroupEvent(event);
      setIsGroupModalOpen(true);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, {}, config);
      setRegisterStatus(prev => ({ ...prev, [eventId]: 'Success!' }));
      fetchEvents();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed';
      setRegisterStatus(prev => ({ ...prev, [eventId]: message }));
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_BASE_URL}/api/events/${eventId}`, config);
      setEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleToggleFeedback = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/events/${id}/toggle-feedback`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      fetchEvents();
    } catch (err) {
      console.error('Error toggling feedback:', err);
      alert(err.response?.data?.message || 'Failed to toggle feedback');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-[2.5rem]" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="p-8 rounded-[2.5rem] bg-red-50 border border-red-100 text-red-700 font-bold text-center backdrop-blur-sm">
        {error}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-slate-950 tracking-tight mb-4">University Events</h1>
          <p className="text-slate-500 font-sans font-medium text-lg opacity-80 max-w-xl leading-relaxed">Stay updated with the latest happenings on campus, from technical symposiums to cultural fests.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-full border border-slate-200 text-slate-950 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>{total} Live Events</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border border-slate-100 backdrop-blur-sm">
           <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-6" />
           <p className="text-slate-950 font-serif font-bold text-2xl mb-2">No upcoming events found</p>
           <p className="text-slate-400 font-medium">Check back later for new updates to the campus calendar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {events.map((event, index) => {
              const isRegistered = event.attendees?.some(a => (a.user?._id || a.user) === userInfo?._id);
              const status = registerStatus[event._id];

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  key={event._id}
                  className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  {event.banner && (
                    <div className="h-48 w-full overflow-hidden border-b border-slate-50 relative">
                      <img 
                        src={event.banner} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      {event.isPaid && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-slate-100 flex items-center gap-1.5 shadow-lg">
                           <CreditCard className="w-3 h-3 text-indigo-600" />
                           <span className="text-[9px] font-black text-slate-950 uppercase tracking-widest">Paid Event</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-10 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200">
                          {event.branch}
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest border border-slate-100">
                          {event.category || 'General'}
                        </span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                         {new Date(event.date) < new Date() ? (
                           <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              Passed
                           </span>
                         ) : (
                           <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                           </span>
                         )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif font-black text-slate-950 leading-tight mb-6 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3.5 text-slate-500">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-slate-500">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider truncate">{event.location}</span>
                      </div>
                      {event.isPaid && (
                        <div className="flex items-center gap-3.5 text-indigo-600 font-black">
                           <CreditCard className="w-4 h-4" />
                           <span className="text-[10px] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Reg. Fee: ₹{event.fee}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {userInfo?.role === 'admin' && (
                      <div className="space-y-3 mb-10">
                         <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-400">Registration Status</span>
                            <span className="text-slate-900">
                               {event.capacity > 0 ? `${event.attendees?.length || 0} / ${event.capacity}` : 'Unlimited Seats'}
                            </span>
                         </div>
                         {event.capacity > 0 && (
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((event.attendees?.length || 0) / event.capacity) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  ((event.attendees?.length || 0) / event.capacity) > 0.8 ? 'bg-amber-500' : 'bg-indigo-600'
                                }`}
                              />
                           </div>
                         )}
                      </div>
                    )}
                  </div>

                  <div className="p-10 pt-0 mt-auto">
                    <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                      {/* Left Side: Attendee Info */}
                      <div 
                        className="flex items-center gap-3 cursor-pointer group/attendees"
                        onClick={() => {
                          if (userInfo?.role === 'admin') {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }
                        }}
                      >
                        <div className="flex -space-x-3 items-center">
                          {(event.attendees || []).slice(0, 3).map((a, i) => (
                            <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-600 uppercase shadow-sm">
                              {(a.fullName || a.user?.profile?.fullName || '?')[0]}
                            </div>
                          ))}
                          {(!event.attendees || event.attendees.length === 0) && (
                            <div className="w-9 h-9 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center shadow-sm">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                          {event.attendees?.length > 3 && (
                            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm z-10">
                              +{event.attendees.length - 3}
                            </div>
                          )}
                        </div>
                        
                        {userInfo?.role === 'admin' && (
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{event.attendees?.length || 0} Registered</span>
                            <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover/attendees:translate-x-1 transition-transform">
                              View Roster <span className="text-[10px]">→</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {userInfo && userInfo.role === 'user' && (
                          <>
                            {isRegistered && event.whatsappLink && (
                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={event.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                <span>Join WhatsApp</span>
                              </motion.a>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRegister(event._id)}
                              disabled={isRegistered || !!status}
                              className={`px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 border-2 ${
                                isRegistered || status
                                  ? 'bg-slate-50 text-slate-400 border-slate-100'
                                  : 'border-slate-950 bg-white text-slate-950 hover:bg-slate-950 hover:text-white shadow-sm'
                              }`}
                            >
                              {isRegistered ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  <span>Going</span>
                                </>
                              ) : (
                                <span>{status || 'Register Now'}</span>
                              )}
                            </motion.button>
                          </>
                        )}

                        {userInfo && userInfo.role === 'admin' && (
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleToggleFeedback(event._id)}
                              className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border-2 ${
                                event.feedbackOpened 
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                              }`}
                            >
                              {event.feedbackOpened ? 'Feedbacks Open' : 'Open Feedback'}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: '#fee2e2', color: '#ef4444' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(event._id)}
                              className="p-3 rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300"
                              title="Delete Event"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="mt-24 flex items-center justify-center gap-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-8 py-4 rounded-full bg-white border border-slate-100 text-slate-950 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-3">
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-12 h-12 rounded-full font-bold text-xs transition-all ${
                  page === i + 1 
                    ? 'bg-slate-950 text-white shadow-xl scale-110' 
                    : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-8 py-4 rounded-full bg-white border border-slate-100 text-slate-950 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      )}

      <AttendeeListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        attendees={selectedEvent?.attendees} 
        feedback={selectedEvent?.feedback}
        sessionTitle={selectedEvent?.title} 
        sessionId={selectedEvent?._id}
        type="events"
        onUpdate={fetchEvents}
      />

      <GroupRegistrationModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        event={selectedGroupEvent}
        userInfo={userInfo}
        onRegisterSuccess={(id) => {
          setRegisterStatus(prev => ({ ...prev, [id]: 'Success!' }));
          fetchEvents();
        }}
      />
    </div>
  );
};

export default EventsList;