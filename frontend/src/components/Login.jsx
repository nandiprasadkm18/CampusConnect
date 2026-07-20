import React, { useState } from 'react';
import axios from 'axios';

const API_URL = '/api/auth';

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '1rem',
};
const inputStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  backgroundColor: 'var(--color-bg-light)', 
  border: '1px solid var(--color-border)', 
  color: 'var(--color-text-dark)', 
  borderRadius: '4px',
  fontFamily: "inherit",
  width: '100%', 
  boxSizing: 'border-box', 
};
const buttonStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  backgroundColor: 'var(--educrown-blue-light)',
  color: 'var(--color-bg-white)',
  border: 'none', 
  fontFamily: "inherit",
  marginTop: '1rem',
  cursor: 'pointer',
  borderRadius: '8px',
  width: '100%',
  fontWeight: 'bold',
};
const labelStyle = {
  color: 'var(--color-text-light)', 
  textTransform: 'uppercase',
  fontSize: '0.9rem',
  display: 'block', 
  marginBottom: '0.5rem', 
  fontWeight: '600',
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      onLogin(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>Login</h2>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      
      <div>
        <label style={labelStyle}>Email:</label>
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Password:</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" style={buttonStyle}>
        Login
      </button>
    </form>
  );
};

export default Login;