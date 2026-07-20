import React from 'react';
import { Link } from 'react-router-dom';
import Login from '../components/Login.jsx';

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
  width: '500px', 
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

const LoginPage = ({ onLogin }) => {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>CampusConnect</h1>
      
      <div style={formContainerStyle}>
        <Login onLogin={onLogin} />
      </div>

      <Link to="/register" style={switchLinkStyle}>
        Don't have an account? Register
      </Link>
    </div>
  );
};

export default LoginPage;
