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
      <p style={{textAlign: 'center', color: 'var(--color-text-light)'}}>What would you like to do?</p>
      
      <div style={{marginTop: '3rem'}}>
        
        <Link 
          to="/events" // This links to the "All Events" page
          style={dashboardLinkStyle}
          onMouseEnter={e => { e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; e.target.style.color = 'var(--educrown-blue-light)'; }}
          onMouseLeave={e => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.target.style.color = 'var(--educrown-blue-dark)'; }}
        >
          Browse All Events
        </Link>
        
        {/* --- ADDED "BROWSE WORKSHOPS" LINK --- */}
        <Link 
          to="/workshops"
          style={dashboardLinkStyle}
          onMouseEnter={e => { e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; e.target.style.color = 'var(--educrown-blue-light)'; }}
          onMouseLeave={e => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.target.style.color = 'var(--educrown-blue-dark)'; }}
        >
          Browse All Workshops
        </Link>
        
        {/* These links will only show for standard users */}
        {user && user.role === 'user' && (
          <>
            <Link 
              to="/my-events"
              style={dashboardLinkStyle}
              onMouseEnter={e => { e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; e.target.style.color = 'var(--educrown-blue-light)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.target.style.color = 'var(--educrown-blue-dark)'; }}
            >
              View My Registered Events
            </Link>

            {/* --- ADDED "MY WORKSHOPS" LINK (as in your screenshot) --- */}
            <Link 
              to="/my-workshops"
              style={dashboardLinkStyle}
              onMouseEnter={e => { e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; e.target.style.color = 'var(--educrown-blue-light)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.target.style.color = 'var(--educrown-blue-dark)'; }}
            >
              View My Registered Workshops
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;