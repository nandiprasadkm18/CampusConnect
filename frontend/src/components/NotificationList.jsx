import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Check, Clock, User, ShieldAlert, MailOpen, BellOff } from 'lucide-react';

const USER_API_URL = 'http://localhost:5000/api/notifications';
const ADMIN_API_URL = 'http://localhost:5000/api/notifications/admin/all';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
          setError('Session required to view academic alerts.');
          setLoading(false);
          return;
      }
      
      const isUserAdmin = userInfo.role === 'admin';
      setIsAdmin(isUserAdmin);

      const fetchURL = isUserAdmin ? ADMIN_API_URL : USER_API_URL;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.get(fetchURL, config);
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Academic alert system is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${USER_API_URL}/readall`, {}, config); 
      fetchNotifications();
    } catch (err) {
      setError('Communication sync failed.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Permanently delete all notifications? This cannot be undone.")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${USER_API_URL}/clearall`, config); 
      setNotifications([]);
    } catch (err) {
      setError('Failed to clear notifications.');
    }
  };

  const handleResponse = async (id, accept, type, sessionId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const endpoint = type === 'event' 
        ? `http://localhost:5000/api/events/${sessionId}/respond-invitation`
        : `http://localhost:5000/api/workshops/${sessionId}/respond-invitation`;
        
      await axios.post(endpoint, { accept }, config);
      
      // Update local state
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, responded: true, read: true } : n));
      
      alert(accept ? "Invitation accepted! Check your dashboard." : "Invitation declined.");
    } catch (err) {
      alert("Failed to respond to invitation.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this notification permanently?")) return;
    try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`${USER_API_URL}/${id}`, config); 
        setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
        setError(err.response?.data?.message || 'Archival failed.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Syncing notifications...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-medium text-center my-12">
      <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-50" />
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif uppercase">
            {isAdmin ? 'System Logs' : 'Inbox'}
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
            {isAdmin ? 'Administrative Oversight' : 'Recent Academic Alerts'}
          </p>
        </div>
        
        {!isAdmin && notifications.length > 0 && (
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllRead} 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <MailOpen className="w-4 h-4" />
              Mark Read
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAll} 
              className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
           <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-5" />
           <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">No Alerts</p>
           <p className="text-slate-400 mt-2">Your inbox is clear for the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notif, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={notif._id} 
                className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${
                  notif.read 
                    ? 'bg-white border-slate-100 opacity-70' 
                    : 'bg-indigo-50/30 border-indigo-100 shadow-lg shadow-indigo-100/20 ring-1 ring-indigo-100'
                }`}
              >
                <div className="flex items-start gap-5 flex-1 pr-6">
                  <div className={`mt-1 p-2.5 rounded-2xl ${notif.read ? 'bg-slate-50 text-slate-300' : 'bg-white text-indigo-600 shadow-sm border border-indigo-50'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1.5 flex-1">
                    <p className={`text-[15px] leading-relaxed ${notif.read ? 'text-slate-500 line-through' : 'text-slate-900 font-medium'}`}>
                      {isAdmin && notif.user && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mr-2 uppercase tracking-tight">
                          <User className="w-3 h-3" /> {notif.user.username}
                        </span>
                      )} 
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-slate-200">|</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  {!notif.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
                  )}
                  
                  {notif.type === 'team_invitation' && !notif.responded && (
                    <div className="flex items-center gap-2 mt-2">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           const sessionId = notif.data?.eventId || notif.data?.workshopId;
                           const sessionType = notif.data?.eventId ? 'event' : 'workshop';
                           handleResponse(notif._id, true, sessionType, sessionId);
                         }}
                         className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                       >
                         Accept
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           const sessionId = notif.data?.eventId || notif.data?.workshopId;
                           const sessionType = notif.data?.eventId ? 'event' : 'workshop';
                           handleResponse(notif._id, false, sessionType, sessionId);
                         }}
                         className="px-4 py-2 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                       >
                         Decline
                       </button>
                    </div>
                  )}

                  {notif.type === 'team_invitation' && notif.responded && (
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Responded</span>
                  )}
                  
                  {isAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: '#fee2e2', color: '#ef4444' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(notif._id)}
                      className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-300 transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationList;