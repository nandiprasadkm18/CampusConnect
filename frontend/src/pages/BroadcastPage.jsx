import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications/broadcast';

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
  width: '500px',
  maxWidth: '90%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Softer shadow
  
  opacity: 0, 
  animation: 'fadeInUp 0.7s ease-out 0.5s forwards', 
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
  marginTop: '0.5rem',
  marginBottom: '1rem',
};
const buttonStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  backgroundColor: 'var(--educrown-blue-light)', // Changed color
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
// --- END STYLES ---

const BroadcastPage = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.length < 5) {
      setError('Message must be at least 5 characters.');
      return;
    }
    setError('');
    setStatus('');
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(API_URL, { message }, config);

      setStatus(data.message);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Broadcast failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ textAlign: 'center', color: 'var(--educrown-blue-dark)' }}>Send Global Broadcast</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          This sends a notification to all standard users.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Message:</label>
            <textarea
              style={{ ...inputStyle, height: '150px' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter broadcast message here..."
              required
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Sending...' : 'Broadcast to Users'}
          </button>
        </form>

        {status && <p style={{ color: 'var(--color-success)', marginTop: '1rem' }}>{status}</p>}
        {error && <p style={{ color: 'var(--color-danger)', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
};

export default BroadcastPage;