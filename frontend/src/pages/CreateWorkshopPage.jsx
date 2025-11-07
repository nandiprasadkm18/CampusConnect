import React from 'react';
import CreateWorkshop from '../components/CreateWorkshop.jsx'; // <-- CHANGED

// --- Styles (Identical to CreateEventPage) ---
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
  width: '500px', 
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
  opacity: 0, 
  animation: 'fadeInUp 0.7s ease-out 0.5s forwards', 
};
// --- END STYLES ---

const CreateWorkshopPage = () => { // <-- CHANGED
  return (
    <div style={pageContainerStyle}>
      <div style={formContainerStyle}>
        <CreateWorkshop /> {/* <-- CHANGED */}
      </div>
    </div>
  );
};

export default CreateWorkshopPage; // <-- CHANGED