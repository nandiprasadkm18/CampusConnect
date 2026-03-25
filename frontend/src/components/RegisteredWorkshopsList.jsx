import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, User, CheckCircle, MessageSquare, Star, BookOpen, QrCode } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const API_URL = `${API_BASE_URL}/api/workshops/myworkshops`;

const RegisteredWorkshopsList = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const fetchMyWorkshops = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('Please log in to manage your enrollments.');
        setLoading(false);
        return;
      }
      setUserInfo(storedUser);

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(API_URL, config);
      setWorkshops(data);
    } catch (err) {
      setError(err.response?.data?.message || 'System encountered an error fetching workshops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWorkshops();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium text-lg">Retrieving your enrollments...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-medium text-center max-w-lg mx-auto my-12 font-sans">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif">Enrolled Workshops</h1>
        <p className="text-slate-500 mt-2 font-serif font-medium text-lg">Your journey of continuous learning and skill mastery.</p>
      </div>

      {workshops.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
           <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-5" />
           <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">No active enrollments</p>
           <p className="text-slate-400 mt-2">Browse the workshop catalog to find your next skill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <AnimatePresence>
            {workshops.map((workshop, index) => {
              const dateObj = new Date(workshop.date);
              const isPast = dateObj < new Date();
              const hasGivenFeedback = workshop.feedback.some(fb => fb.user?._id === userInfo?._id || fb.user === userInfo?._id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  key={workshop._id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500"
                >
                  <div className="p-10 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="px-5 py-2 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-[0.15em] border border-indigo-100 shadow-sm">
                        {workshop.branch}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isPast ? 'Session Ended' : 'Upcoming Session'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-6 font-serif group-hover:text-indigo-600 transition-colors">
                      {workshop.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5 mb-8">
                      <div className="flex items-center gap-4 text-slate-500 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold">{dateObj.toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                        <MapPin className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold truncate">{workshop.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 border-t border-slate-50 pt-8 mt-4 group-hover:text-slate-600 transition-colors">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Facilitated by {workshop.creator?.username || 'University Personnel'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-10 border-t border-slate-100">
                    {!isPast && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 text-slate-900 font-bold uppercase text-[10px] tracking-[0.2em] bg-white py-4 rounded-2xl border border-slate-200">
                          {workshop.attended ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <QrCode className="w-5 h-5 text-slate-400" />
                          )}
                          <span>{workshop.attended ? 'Attendance Verified' : 'Session Entry Token'}</span>
                        </div>

                        {!workshop.attended && (
                          <div className="py-4 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-serif">Scan Admin QR at venue to mark attendance</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {workshop.feedbackOpened && !hasGivenFeedback && (
                      <button
                        onClick={() => {
                          setSelectedWorkshop(workshop);
                          setIsFeedbackModalOpen(true);
                        }}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Give Feedback
                      </button>
                    )}
                    
                    {hasGivenFeedback && (
                      <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm font-serif text-slate-500 font-medium">
                        <div className="p-3 bg-indigo-50 rounded-full mb-3 text-indigo-600">
                           <Star className="w-6 h-6 fill-indigo-600" />
                        </div>
                        <p className="text-sm">Academic record updated with your feedback.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {selectedWorkshop && (
            <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              session={selectedWorkshop}
              type="workshops"
              onFeedbackSubmitted={fetchMyWorkshops}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RegisteredWorkshopsList;