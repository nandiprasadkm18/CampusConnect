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
import Chatbot from './components/Chatbot.jsx'; // <-- New Chatbot Import

import './App.css';

const LinkItem = ({ to, children }) => (
  <Link to={to} className="nav-link">
    {children}
  </Link>
);


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
    <div className="app-container">
      {user && (
        <>
          <header className="app-header">
            <div className="header-logo">
              CampusConnect
            </div>
            <nav className="app-nav">
              <LinkItem to="/">Home</LinkItem>

              <LinkItem to="/events">Events</LinkItem>

              <LinkItem to="/workshops">Workshops</LinkItem>

              {user.role === 'user' && (
                <>
                  <LinkItem to="/my-events">My Events</LinkItem>

                  {/* --- 2. FIX TYPO & ADD LINK --- */}
                  <LinkItem to="/my-workshops">My Workshops</LinkItem>
                  <LinkItem to="/profile">My Profile</LinkItem>
                  {/* --- END FIX --- */}
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <LinkItem to="/create-event">Add Event</LinkItem>

                  {/* --- 3. FIX TYPO --- */}
                  <LinkItem to="/create-workshop">Add Workshop</LinkItem>
                  {/* --- END FIX --- */}

                  <LinkItem to="/admin/broadcast">Broadcast</LinkItem>
                </>
              )}

              <LinkItem to="/notifications" title="Notifications">
                🔔
              </LinkItem>

              <button
                onClick={handleLogout}
                className="btn-logout"
              >
                Logout ({user.username})
              </button>
            </nav>
          </header>
        </>
      )}

      <div className={user ? "main-content" : ""}>
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

      {user && <Chatbot />}
    </div>
  );
}

export default App;