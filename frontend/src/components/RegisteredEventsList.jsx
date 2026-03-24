import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, User, CheckCircle, MessageSquare, Star, BookOpen, Clock, QrCode } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const API_URL = 'http://localhost:5000/api/events/myevents';

const RegisteredEventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const fetchMyEvents = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('Session synchronization required.');
        setLoading(false);
        return;
      }
      setUserInfo(storedUser);

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(API_URL, config);
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Academic record retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-serif font-medium text-lg">Retrieving academic engagements...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-serif font-medium text-center max-w-lg mx-auto my-12">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-serif">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">Confirmed Engagements</h1>
        <p className="text-slate-500 mt-2 font-medium text-lg border-l-4 border-slate-900 pl-4 ml-1">Official repository of registered university events.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-200">
           <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-5" />
           <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">No Active Registrations</p>
           <p className="text-slate-400 mt-2">Consult the campus calendar for upcoming sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <AnimatePresence>
            {events.map((event, index) => {
              const dateObj = new Date(event.date);
              const isPast = dateObj < new Date();
              const hasGivenFeedback = event.feedback.some(fb => fb.user?._id === userInfo?._id || fb.user === userInfo?._id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  key={event._id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] transition-all duration-500"
                >
                  <div className="p-10 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="px-5 py-2 rounded-2xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                        {event.branch}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-900 border border-slate-200'}`}>
                        {isPast ? 'COMPLETED' : 'STATUS: CONFIRMED'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-6 uppercase tracking-tight group-hover:text-black transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5 mb-8">
                      <div className="flex items-center gap-4 text-slate-600 font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold uppercase tracking-widest">{dateObj.toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-600 font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold truncate uppercase tracking-widest">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 border-t border-slate-50 pt-8 mt-4 group-hover:text-slate-600 transition-colors">
                      <User className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Authorized by {event.creator?.username || 'Administration'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/30 p-10 border-t border-slate-100">
                    {!isPast && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 text-slate-900 font-bold uppercase text-[10px] tracking-[0.2em] bg-white py-4 rounded-2xl border border-slate-200">
                          {event.attended ? (
                             <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                             <QrCode className="w-5 h-5 text-slate-400" />
                          )}
                          <span>{event.attended ? 'Attendance Verified' : 'Standard Entry Pass'}</span>
                        </div>

                        {!event.attended && (
                          <div className="py-4 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scan Admin QR at venue to mark attendance</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {event.feedbackOpened && !hasGivenFeedback && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsFeedbackModalOpen(true);
                        }}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Give Feedback
                      </button>
                    )}
                    
                    {hasGivenFeedback && (
                      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-slate-500 font-medium border-t-4 border-t-slate-900">
                        <div className="p-3 bg-slate-900 rounded-full mb-4 text-white">
                           <Star className="w-6 h-6 fill-white" />
                        </div>
                        <p className="text-xs uppercase tracking-widest font-bold">Formal Feedback Archived</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {selectedEvent && (
            <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              session={selectedEvent}
              type="events"
              onFeedbackSubmitted={fetchMyEvents}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RegisteredEventsList;