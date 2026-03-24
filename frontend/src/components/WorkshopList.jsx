import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, User, Trash2, CheckCircle, ExternalLink, Calendar, Users, CreditCard } from 'lucide-react';
import AttendeeListModal from './AttendeeListModal.jsx';
import GroupRegistrationModal from './GroupRegistrationModal.jsx';
import Skeleton from './ui/Skeleton.jsx';

const API_URL = 'http://localhost:5000/api/workshops';

const WorkshopList = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [registerStatus, setRegisterStatus] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupWorkshop, setSelectedGroupWorkshop] = useState(null);

  const fetchWorkshops = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('You must be logged in to see workshops.');
        setLoading(false);
        return;
      }
      setUserInfo(storedUser);

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(`${API_URL}?page=${page}&limit=6`, config);
      setWorkshops(data.workshops);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshopId) => {
    if (registerStatus[workshopId]) return;
    
    const workshop = workshops.find(w => w._id === workshopId);
    if (workshop && (workshop.isPaid || workshop.maxGroupSize > 1)) {
      setSelectedGroupWorkshop(workshop);
      setIsGroupModalOpen(true);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`http://localhost:5000/api/workshops/${workshopId}/register`, {}, config);
      setRegisterStatus(prev => ({ ...prev, [workshopId]: 'Success!' }));
      fetchWorkshops();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed';
      setRegisterStatus(prev => ({ ...prev, [workshopId]: message }));
    }
  };

  const handleDelete = async (workshopId) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/workshops/${workshopId}`, config);
      setWorkshops(prev => prev.filter(w => w._id !== workshopId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workshop');
    }
  };

  const handleToggleFeedback = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/workshops/${id}/toggle-feedback`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      fetchWorkshops();
    } catch (err) {
      console.error('Error toggling feedback:', err);
      alert(err.response?.data?.message || 'Failed to toggle feedback');
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [page]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-[2.5rem]" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-center">
       <div className="p-8 rounded-[2.5rem] bg-red-50 border border-red-100 text-red-700 font-bold">
        {error}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-slate-950 tracking-tight mb-4">Skill Workshops</h1>
          <p className="text-slate-500 font-sans font-medium text-lg opacity-80 max-w-xl leading-relaxed">Hands-on learning experiences led by industry experts and academic veterans.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-full border border-slate-200 text-slate-950 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>{total} Active Sessions</span>
        </div>
      </div>

      {workshops.length === 0 ? (
        <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border border-slate-100 backdrop-blur-sm">
           <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
           <p className="text-slate-950 font-serif font-bold text-2xl mb-2">No workshops available</p>
           <p className="text-slate-400 font-medium">Please check back later for newly scheduled skill sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {workshops.map((workshop, index) => {
              const isRegistered = workshop.attendees?.some(a => (a.user?._id || a.user) === userInfo?._id);
              const status = registerStatus[workshop._id];

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  key={workshop._id}
                  className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-500 flex flex-col overflow-hidden"
                >
                  {workshop.banner && (
                    <div className="h-48 w-full overflow-hidden border-b border-slate-50 relative">
                      <img 
                        src={workshop.banner} 
                        alt={workshop.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      {workshop.isPaid && (
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
                           {workshop.branch}
                         </span>
                         <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest border border-slate-100 uppercase">
                           {workshop.category}
                         </span>
                       </div>
                       
                       <div className="flex items-center gap-2">
                         {new Date(workshop.date) < new Date() ? (
                           <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              Concluded
                           </span>
                         ) : (
                           <span className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                              Upcoming
                           </span>
                         )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif font-black text-slate-950 leading-tight mb-6 group-hover:text-indigo-600 transition-colors">
                      {workshop.title}
                    </h3>
                    
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3.5 text-slate-500">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(workshop.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-slate-500">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider truncate">{workshop.location}</span>
                      </div>
                      {workshop.isPaid && (
                        <div className="flex items-center gap-3.5 text-indigo-600 font-black">
                           <CreditCard className="w-4 h-4" />
                           <span className="text-[10px] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Reg. Fee: ₹{workshop.fee}</span>
                        </div>
                      )}
                    </div>

                    {userInfo?.role === 'admin' && (
                      <div className="space-y-3 mb-10">
                         <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-400">Capacity Utilization</span>
                            <span className="text-slate-900">
                               {workshop.capacity > 0 ? `${workshop.attendees?.length || 0} / ${workshop.capacity}` : 'Open Admission'}
                            </span>
                         </div>
                         {workshop.capacity > 0 && (
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((workshop.attendees?.length || 0) / workshop.capacity) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  ((workshop.attendees?.length || 0) / workshop.capacity) > 0.8 ? 'bg-amber-500' : 'bg-indigo-600'
                                }`}
                              />
                           </div>
                         )}
                      </div>
                    )}
                  </div>

                  <div className="p-10 pt-0 mt-auto">
                    <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-2">
                       {/* Left Side: Participant Info */}
                       <div 
                        className="flex items-center gap-3 cursor-pointer group/attendees"
                        onClick={() => {
                          if (userInfo?.role === 'admin') {
                            setSelectedWorkshop(workshop);
                            setIsModalOpen(true);
                          }
                        }}
                      >
                        <div className="flex -space-x-3 items-center">
                          {(workshop.attendees || []).slice(0, 3).map((a, i) => (
                            <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-600 uppercase shadow-sm">
                              {(a.fullName || a.user?.profile?.fullName || '?')[0]}
                            </div>
                          ))}
                          {(!workshop.attendees || workshop.attendees.length === 0) && (
                            <div className="w-9 h-9 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center shadow-sm">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                          {workshop.attendees?.length > 3 && (
                            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm z-10">
                              +{workshop.attendees.length - 3}
                            </div>
                          )}
                        </div>
                        
                        {userInfo?.role === 'admin' && (
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{workshop.attendees?.length || 0} Registered</span>
                            <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover/attendees:translate-x-1 transition-transform">
                              View Roster <span className="text-[10px]">→</span>
                            </span>
                          </div>
                        )}
                      </div>

                        <div className="flex items-center gap-3">
                          {userInfo && userInfo.role === 'user' && (
                            <>
                              {isRegistered && workshop.whatsappLink && (
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={workshop.whatsappLink}
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
                                onClick={() => handleRegister(workshop._id)}
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
                                    <span>Enrolled</span>
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
                                onClick={() => handleToggleFeedback(workshop._id)}
                                className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border-2 ${
                                  workshop.feedbackOpened 
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                                }`}
                              >
                                {workshop.feedbackOpened ? 'Feedbacks Open' : 'Open Feedback'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: '#fee2e2', color: '#ef4444' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(workshop._id)}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300"
                                title="Delete Workshop"
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
        attendees={selectedWorkshop?.attendees} 
        feedback={selectedWorkshop?.feedback}
        sessionTitle={selectedWorkshop?.title} 
        sessionId={selectedWorkshop?._id}
        type="workshops"
        onUpdate={fetchWorkshops}
      />

      <GroupRegistrationModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        event={selectedGroupWorkshop}
        userInfo={userInfo}
        type="workshops"
        onRegisterSuccess={(id) => {
          setRegisterStatus(prev => ({ ...prev, [id]: 'Success!' }));
          fetchWorkshops();
        }}
      />
    </div>
  );
};

export default WorkshopList;