import React from 'react';
import { Link } from 'react-router-dom';
import Register from '../components/Register.jsx';

// Styles
const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '3rem',
};

const titleStyle = {
  fontFamily: "Georgia, 'Times New Roman', Times, serif",
  color: 'var(--educrown-blue-dark)',
  textDecoration: 'none',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '3.5rem',
  marginBottom: '2rem',
  animation: 'none',
};

const formContainerStyle = {
  border: '1px solid var(--color-border)',
  padding: '2rem',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-white)',
  
  // --- THIS IS THE CHANGE ---
  width: '500px', // Make it wider for the new fields
  // --- END CHANGE ---
  
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
  opacity: 0, 
  animation: 'fadeInUp 0.6s ease-out 0.2s forwards', 
};

const switchLinkStyle = {
  color: 'var(--educrown-blue-light)',
  textDecoration: 'none',
  marginTop: '1.5rem',
  fontSize: '1rem',
  opacity: 0,
  animation: 'fadeInUp 0.6s ease-out 0.4s forwards', 
};

const RegisterPage = () => {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>CampusConnect</h1>
      
      <div style={formContainerStyle}>
        <Register />
      </div>

      <Link to="/login" style={switchLinkStyle}>
        Already have an account? Login
      </Link>
    </div>
  );
};

export default RegisterPage;