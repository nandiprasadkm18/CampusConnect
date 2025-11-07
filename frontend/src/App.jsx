import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RegisteredEventsPage from './pages/RegisteredEventsPage.jsx';
import AllEventsPage from './pages/AllEventsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import BroadcastPage from './pages/BroadcastPage.jsx';
import BranchEventsPage from './pages/BranchEventsPage.jsx'; 
import BranchListPage from './pages/BranchListPage.jsx'; 

// --- 1. IMPORT NEW PAGES ---
import AllWorkshopsPage from './pages/AllWorkshopsPage.jsx';
import CreateWorkshopPage from './pages/CreateWorkshopPage.jsx';
import RegisteredWorkshopsPage from './pages/RegisteredWorkshopsPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx'; // <-- IMPORT

import './App.css'; 

// --- Styles (no changes) ---
const headerStyle = {
  textAlign: 'center',
  padding: '1.5rem',
  backgroundColor: 'var(--educrown-blue-dark)',
  color: 'var(--color-bg-white)',
  fontSize: '2.5rem',
  fontFamily: "Georgia, 'Times New Roman', Times, serif",
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '2px',
};
const navStyle = {
  background: 'var(--color-bg-white)',
  padding: '0.75rem 2rem', 
  marginBottom: '1rem',
  borderBottom: '1px solid var(--color-border)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
};
const linkStyle = {
  color: 'var(--educrown-blue-dark)',
  margin: '0 1.5rem', 
  textDecoration: 'none',
  fontWeight: '600',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
  fontSize: '1rem',
};
const containerStyle = {
  padding: '0 2rem',
  maxWidth: '900px',
  margin: '0 auto',
};
// --- End styling ---


function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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

  return (
    <div>
      {user && (
        <>
          <header style={headerStyle}>
            CampusConnect
          </header>

          <nav style={navStyle}>
            <Link to="/" style={linkStyle}>
              Home
            </Link>
            
            <Link to="/events" style={linkStyle}>
              Events
            </Link>
            
            <Link to="/workshops" style={linkStyle}>
              Workshops
            </Link>

            {user.role === 'user' && (
              <>
                <Link to="/my-events" style={linkStyle}>
                  My Events
                </Link>
                
                {/* --- 2. FIX TYPO & ADD LINK --- */}
                <Link to="/my-workshops" style={linkStyle}>
                  My Workshops
                </Link> 
                <Link to="/profile" style={linkStyle}>
                  My Profile
                </Link>
                {/* --- END FIX --- */}
              </>
            )}
            
            {user.role === 'admin' && (
              <>
                <Link to="/create-event" style={linkStyle}>
                  Add Event
                </Link>

                {/* --- 3. FIX TYPO --- */}
                <Link to="/create-workshop" style={linkStyle}>
                  Add Workshop
                </Link>
                {/* --- END FIX --- */}

                <Link to="/admin/broadcast" style={linkStyle}>
                  Broadcast
                </Link>
              </>
            )}

            <Link to="/notifications" style={linkStyle} title="Notifications">
              🔔
            </Link>

            <button 
              onClick={handleLogout} 
              style={{...linkStyle, background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Logout ({user.username})
            </button>
          </nav>
        </>
      )}
      
      <div style={user ? containerStyle : {}}>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} /> 

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
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;