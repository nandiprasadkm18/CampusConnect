import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Activity, 
  Star,
  TrendingUp,
  ChevronRight,
  BookOpen,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

const COLORS = ['#6366f1', '#475569', '#1e293b', '#64748b', '#94a3b8'];

// ─── Student Card Component ───
const DashboardCard = ({ to, title, description, icon: Icon, delay, variant = 'default' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    <Link
      to={to}
      className={`group relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden h-full ${
        variant === 'primary' 
          ? 'bg-slate-950 border-slate-800 shadow-2xl shadow-indigo-500/10' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 ${
        variant === 'primary' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-900 border border-slate-100'
      }`}>
        <Icon className="w-7 h-7" />
      </div>

      <h3 className={`text-xl font-serif font-bold mb-3 tracking-tight ${variant === 'primary' ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed mb-8 flex-1 ${variant === 'primary' ? 'text-slate-400' : 'text-slate-500'}`}>
        {description}
      </p>

      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
        variant === 'primary' ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600 group-hover:translate-x-1'
      }`}>
        <span>Explore</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>

      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </Link>
  </motion.div>
);

// ─── Student Home View ───
const StudentHome = ({ user }) => (
  <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
    <div className="text-center mb-20">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-serif font-extrabold text-slate-950 tracking-tighter leading-[1.1] mb-6"
      >
        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-950 italic font-medium">{user?.profile?.fullName || user?.username || 'Student'}</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto text-slate-500 text-base md:text-lg font-medium leading-relaxed"
      >
        Your gateway to academic excellence and campus life.
      </motion.p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <DashboardCard 
        to="/events" 
        title="Campus Events" 
        description="Discover faculty events, hackathons, and cultural fests."
        icon={Calendar}
        delay={0.2}
        variant="primary"
      />
      <DashboardCard 
        to="/workshops" 
        title="Skill Workshops" 
        description="Master technologies through hands-on guided sessions."
        icon={BookOpen}
        delay={0.3}
      />
      <DashboardCard 
        to="/my-events" 
        title="My Registrations" 
        description="Track all the events and workshops you're attending."
        icon={ShieldCheck}
        delay={0.4}
      />
      <DashboardCard 
        to="/profile" 
        title="My Profile" 
        description="View and manage your official institutional identity."
        icon={UserIcon}
        delay={0.5}
      />
    </div>

  </div>
);

// ─── Admin Dashboard View ───
const AdminDashboard = ({ stats, activityList }) => {
  const registrationTrends = stats?.dailyTrends?.map(d => {
    const date = new Date(d._id);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      registrations: d.count
    };
  }) || [];

  const totalEvents = stats?.summary?.totalEvents || 0;
  const totalWorkshops = stats?.summary?.totalWorkshops || 0;
  const totalRegs = stats?.summary?.totalRegistrations || 0;
  const totalAtt = stats?.summary?.totalAttendance || 0;
  const avgRating = stats?.summary?.avgGlobalRating || 0;
  const attendanceRate = totalRegs > 0 ? Math.round((totalAtt / totalRegs) * 100) : 0;
  const pieTotal = totalEvents + totalWorkshops;

  const pieData = pieTotal > 0 ? [
    { name: 'Events', value: totalEvents },
    { name: 'Workshops', value: totalWorkshops }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Campus analytics overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">System Online</span>
        </div>
      </div>

      {/* Stats Grid — 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Students" 
          value={stats?.summary?.totalStudents || 0}
          icon={Users} 
          delay={0.05}
        />
        <StatCard 
          label="Attendance Rate" 
          value={`${attendanceRate}%`}
          icon={Activity}  
          delay={0.1}
        />
        <StatCard 
          label="Avg Rating" 
          value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
          icon={Star} 
          delay={0.15}
        />
        <StatCard 
          label="Total Sessions" 
          value={pieTotal}
          subtitle={`${totalEvents} events · ${totalWorkshops} workshops`}
          icon={Calendar} 
          delay={0.2}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {/* Registration Trend Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900">Registrations</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Last 7 days</p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="px-4 py-4">
              {registrationTrends.length > 0 ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationTrends}>
                      <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.08}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-5} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px', padding: '8px 12px' }}
                      />
                      <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-xs text-slate-400">No registration data yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bottom Row: Pie + Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Engagement Pie */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-[13px] font-semibold text-slate-900">Session Split</h3>
              </div>
              <div className="p-4">
                {pieData.length > 0 ? (
                  <>
                    <div className="h-[180px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-lg font-semibold text-slate-900 tabular-nums">{pieTotal}</span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-5 pt-2 pb-2">
                      {pieData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-[11px] text-slate-500 font-medium">{entry.name} ({entry.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[180px] flex items-center justify-center">
                    <p className="text-xs text-slate-400">No sessions created yet</p>
                  </div>
                )}
              </div>
            </motion.div>
                 {/* Top Categories */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-slate-900 rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="text-[13px] font-semibold text-white">Top Categories</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">By registration count</p>
              </div>
              <div className="px-6 py-10 flex items-end justify-around gap-2 h-[220px]">
                {stats?.categoryPerformance?.length > 0 ? (
                  stats.categoryPerformance.slice(0, 4).map((cat, idx) => {
                    const percentage = totalRegs > 0 ? Math.min((cat.count / totalRegs) * 100 * 1.5, 100) : 0;
                    return (
                      <div key={cat._id} className="flex flex-col items-center gap-4 h-full justify-end group/bar flex-1">
                        <div className="relative flex flex-col items-center w-full h-full justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.4 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                            className="bg-indigo-500 w-6 rounded-lg relative shadow-lg shadow-indigo-500/20 group-hover/bar:bg-indigo-400 transition-colors"
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white tabular-nums opacity-0 group-hover/bar:opacity-100 transition-opacity">
                              {cat.count}
                            </span>
                          </motion.div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center truncate w-full px-1">
                          {cat._id}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-8">
                    <p className="text-xs text-slate-500 italic">No activity yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Activity Sidebar — 1/3 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ActivityFeed activities={activityList} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main HomePage Container ───
const HomePage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Only fetch analytics for admins
          if (parsedUser.role === 'admin') {
            const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/analytics/overview', config);
            setStats(data);
          }
        }
      } catch (err) {
        console.error("Dashboard sync failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activityList = stats?.recentActivity || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-48 rounded-[2.5rem]" />
          <Skeleton className="h-48 rounded-[2.5rem]" />
          <Skeleton className="h-48 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard stats={stats} activityList={activityList} />;
  }

  return <StudentHome user={user} />;
};

export default HomePage;