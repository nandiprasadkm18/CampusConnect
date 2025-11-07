import React from 'react';
import NotificationList from '../components/NotificationList.jsx';

// --- Styles (for the Educrown theme) ---
const pageContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '3rem',
};

const listContainerStyle = {
  border: '1px solid var(--color-border)',
  padding: '2rem',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-white)',
  width: '800px', // Wider
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  
  opacity: 0, 
  animation: 'fadeInUp 0.7s ease-out 0.5s forwards', 
};
// --- END STYLES ---

const NotificationsPage = () => {
  return (
    <div style={pageContainerStyle}>
      <div style={listContainerStyle}>
        <NotificationList />
      </div>
    </div>
  );
};

export default NotificationsPage;