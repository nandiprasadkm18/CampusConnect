import React from 'react';
import MyProfile from '../components/MyProfile.jsx';

// Styles
const pageContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '3rem',
};

const formContainerStyle = {
  border: '1px solid var(--color-border)',
  padding: '2.5rem', // A bit more padding
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-white)',
  width: '600px', // A bit wider
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
  opacity: 0, 
  animation: 'fadeInUp 0.7s ease-out 0.5s forwards', 
};

const MyProfilePage = () => {
  return (
    <div style={pageContainerStyle}>
      <div style={formContainerStyle}>
        <MyProfile />
      </div>
    </div>
  );
};

export default MyProfilePage;