import React from 'react';
import CreateEvent from '../components/CreateEvent.jsx';

// --- NEW "EDUCROWN" STYLES ---
const pageContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '3rem',
};

const formContainerStyle = {
  border: '1px solid var(--color-border)',
  padding: '2rem',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-white)',
  width: '500px', // Set a clean width
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Soft shadow
  
  opacity: 0, 
  animation: 'fadeInUp 0.7s ease-out 0.5s forwards', 
};
// --- END STYLES ---

const CreateEventPage = () => {
  return (
    <div style={pageContainerStyle}>
      <div style={formContainerStyle}>
        <CreateEvent />
      </div>
    </div>
  );
};

export default CreateEventPage;