import React from 'react';
import CreateWorkshop from '../components/CreateWorkshop.jsx'; // <-- CHANGED

// --- Styles (Identical to CreateEventPage) ---
const CreateWorkshopPage = () => { // <-- CHANGED
  return (
    <div className="py-8 min-h-screen bg-white">
      <CreateWorkshop /> {/* <-- CHANGED */}
    </div>
  );
};

export default CreateWorkshopPage; // <-- CHANGED