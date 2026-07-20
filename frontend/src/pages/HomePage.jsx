import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Styles for the dashboard links
const dashboardLinkStyle = {
  display: 'block',
  padding: '1.5rem',
  margin: '1rem 0',
  textDecoration: 'none',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-white)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  color: 'var(--educrown-blue-dark)',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
};

// Style for the "Welcome" title
const titleStyle = {
  color: 'var(--educrown-blue-dark)',
  textTransform: 'uppercase',
  textAlign: 'center',
  animation: 'fadeInUp 0.7s ease-out 0.2s forwards',
  opacity: 0,
};

// Helper component for animated dashboard links
const DashboardLink = ({ to, children, delay }) => (
  <Link
    to={to}
    className="animate-slide-in-right hover-scale"
    style={{
      ...dashboardLinkStyle,
      animationDelay: `${delay}s`
    }}
  >
    {children}
  </Link>
);

const HomePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      <h1 style={titleStyle}>Welcome, {user ? user.username : 'User'}</h1>
      <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>What would you like to do?</p>

      <div style={{ marginTop: '3rem' }}>

        {/* Common Links */}
        <DashboardLink to="/events" delay={0.1}>
          Browse All Events
        </DashboardLink>

        <DashboardLink to="/workshops" delay={0.2}>
          Browse All Workshops
        </DashboardLink>

        {/* --- ADMIN SPECIFIC LINKS --- */}
        {user && user.role === 'admin' && (
          <>
            <DashboardLink to="/create-event" delay={0.3}>
              + Add New Event
            </DashboardLink>

            <DashboardLink to="/create-workshop" delay={0.4}>
              + Add New Workshop
            </DashboardLink>
          </>
        )}

        {/* --- STUDENT SPECIFIC LINKS --- */}
        {user && user.role === 'user' && (
          <>
            <DashboardLink to="/my-events" delay={0.3}>
              View My Registered Events
            </DashboardLink>

            <DashboardLink to="/my-workshops" delay={0.4}>
              View My Registered Workshops
            </DashboardLink>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;