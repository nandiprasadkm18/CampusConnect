import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RegisteredEventsPage from './pages/RegisteredEventsPage.jsx';
import AllEventsPage from './pages/AllEventsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import BroadcastPage from './pages/BroadcastPage.jsx';
import BranchEventsPage from './pages/BranchEventsPage.jsx';
import BranchListPage from './pages/BranchListPage.jsx';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, LogOut, User as UserIcon, ChevronRight, Calendar, BookOpen } from 'lucide-react';

// --- 1. IMPORT NEW PAGES ---
import AllWorkshopsPage from './pages/AllWorkshopsPage.jsx';
import CreateWorkshopPage from './pages/CreateWorkshopPage.jsx';
import RegisteredWorkshopsPage from './pages/RegisteredWorkshopsPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ScannerPage from './pages/ScannerPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Chatbot from './components/Chatbot.jsx';
import AttendanceLogPage from './pages/AttendanceLogPage.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';
import ActivityPage from './pages/ActivityPage.jsx';

import './App.css';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex flex-col items-end px-6 border-r border-slate-100 min-w-max">
      <p className="text-sm font-serif font-black text-slate-950 tracking-tight whitespace-nowrap">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mt-0.5">
        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
};

const LinkItem = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
    {children}
  </NavLink>
);


function App() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Fetch initial unread count
      const fetchUnreadCount = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          const { data } = await axios.get('http://localhost:5000/api/notifications', config);
          setUnreadCount(data.filter(n => !n.read).length);
        } catch (err) {
          console.error('Failed to fetch unread count', err);
        }
      };
      fetchUnreadCount();
    }

    // Initialize Socket.io
    const socket = io('http://localhost:5000');
    
    socket.on('new_event', (event) => {
      setToast({ message: `New Event: ${event.title}`, type: 'event' });
      setUnreadCount(prev => prev + 1);
      setTimeout(() => setToast(null), 5000);
    });

    socket.on('new_workshop', (workshop) => {
      setToast({ message: `New Workshop: ${workshop.title}`, type: 'workshop' });
      setUnreadCount(prev => prev + 1);
      setTimeout(() => setToast(null), 5000);
    });

    socket.on('broadcast_update', (msg) => {
      setToast({ message: msg.message || msg, type: 'broadcast' });
      setUnreadCount(prev => prev + 1);
      setTimeout(() => setToast(null), 5000);
    });

    return () => socket.disconnect();
  }, []);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <div className="app-container">
      {user && (
        <>
          <header className="app-header glass sticky top-0 z-[100]">
            <div className="header-logo font-serif tracking-tight pr-10 border-r border-slate-100 h-full flex items-center">
              Campus<span className="text-indigo-600">Connect</span>
            </div>

            <nav className="app-nav px-8">
              <LinkItem to="/">Dashboard</LinkItem>
              <LinkItem to="/events">Events</LinkItem>
              <LinkItem to="/workshops">Workshops</LinkItem>
              
              {user.role === 'admin' && (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-100 ml-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
                    
                    <div className="relative group/create py-2">
                      <div className="nav-link flex items-center gap-1.5 cursor-pointer">
                        <span>Create</span>
                        <ChevronRight className="w-3 h-3 rotate-90" />
                      </div>
                      
                      <div className="absolute top-full left-0 pt-1 opacity-0 translate-y-2 pointer-events-none group-hover/create:opacity-100 group-hover/create:translate-y-0 group-hover/create:pointer-events-auto transition-all duration-300 z-[110]">
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-500/10 p-2 min-w-[180px] backdrop-blur-xl">
                          <Link 
                            to="/create-event" 
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">New Event</span>
                          </Link>
                          
                          <Link 
                            to="/create-workshop" 
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">New Workshop</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <LinkItem to="/admin/scan">Scan</LinkItem>
                    <LinkItem to="/admin/broadcast">Broadcast</LinkItem>
                </div>
              )}
            </nav>

            <div className="flex-1" />

            <div className="flex items-center gap-6">
              <Clock />

              <Link to="/notifications" className="relative group p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                {unreadCount > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                )}
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                <div className="flex flex-col items-end">
                  <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user?.profile?.fullName || user.username}</p>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest opacity-80">{user.role}</p>
                </div>
                <div 
                  onClick={() => navigate('/profile')}
                  title="View Profile"
                  className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-serif font-black cursor-pointer hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
                >
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 active:scale-90"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      <div className={user ? "main-content-wrapper" : ""}>
        {user && (
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-10">
            <Breadcrumbs />
          </div>
        )}
        <div className={user ? "main-content-inner" : ""}>
          <AnimatePresence mode="wait">

          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
            <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />
            
            {/* Public Attendance Gateway */}
            <Route path="/attendance/:type/:id" element={<AttendanceLogPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />

              <Route path="/events" element={<AllEventsPage />} />
              <Route path="/events/:branchName" element={<BranchEventsPage />} />
              <Route path="/branches" element={<BranchListPage />} />

              <Route path="/my-events" element={<RegisteredEventsPage />} />
              <Route path="/create-event" element={<CreateEventPage />} />

              <Route path="/workshops" element={<AllWorkshopsPage />} />
              <Route path="/my-workshops" element={<RegisteredWorkshopsPage />} />
              <Route path="/create-workshop" element={<CreateWorkshopPage />} />

              {/* --- 4. ADD NEW PROFILE ROUTE --- */}
              <Route path="/profile" element={<MyProfilePage />} />

              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/admin/broadcast" element={<BroadcastPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/scan" element={<ScannerPage />} />
              <Route path="/admin/activity" element={<ActivityPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </div>

    {user && <Chatbot />}

      {/* Real-time Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[9999] w-full max-w-sm px-6"
          >
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-500 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{toast.type} Update</p>
                  <p className="text-sm font-bold line-clamp-1">{toast.message}</p>
                </div>
              </div>
              <button onClick={() => setToast(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;