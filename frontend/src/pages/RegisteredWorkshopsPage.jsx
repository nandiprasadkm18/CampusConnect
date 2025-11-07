import React from 'react';
import RegisteredWorkshopsList from '../components/RegisteredWorkshopsList.jsx'; // <-- CHANGED

const RegisteredWorkshopsPage = () => { // <-- CHANGED
  return (
    <div>
      <RegisteredWorkshopsList /> {/* <-- CHANGED */}
    </div>
  );
};

export default RegisteredWorkshopsPage; // <-- CHANGED