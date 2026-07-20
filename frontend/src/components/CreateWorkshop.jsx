import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/workshops';

// --- Styles (Identical to CreateEvent) ---
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
  borderRadius: '8px',
  width: '100%',
  fontWeight: 'bold',
  cursor: 'pointer',
};
const labelStyle = {
  color: 'var(--color-text-light)', 
  textTransform: 'uppercase',
  fontSize: '0.9rem',
  display: 'block', 
  marginBottom: '0.5rem', 
  fontWeight: '600',
};
// --- End Styles ---

const branches = [
  { key: 'cse', name: 'Computer Science (CSE)' },
  { key: 'ise', name: 'Information Science (ISE)' },
  { key: 'aiml', name: 'CS - AI/ML' },
  { key: 'ec', name: 'Electronics (EC)' },
  { key: 'eee', name: 'Electrical (EEE)' },
  { key: 'civil', name: 'Civil' },
  { key: 'mechanical', name: 'Mechanical' },
  { key: 'general', name: 'General / All-College' }
];

const CreateWorkshop = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [branch, setBranch] = useState('general');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- 1. GET TODAY'S DATE ---
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        setError('You must be logged in to create a workshop.');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const payload = { title, description, date, location, branch };
      
      const { data } = await axios.post(API_URL, payload, config);

      console.log('Workshop created:', data);
      setSuccess('Workshop created successfully!');
      
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setBranch('general');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Workshop creation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>Create New Workshop</h2>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {success && <p style={{ color: 'var(--color-success)' }}>{success}</p>}
      
      <div>
        <label style={labelStyle}>Workshop Title:</label>
        <input style={inputStyle} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      
      <div>
        <label style={labelStyle}>Branch:</label>
        <select style={inputStyle} value={branch} onChange={(e) => setBranch(e.target.value)} required>
          {branches.map(b => (
            <option key={b.key} value={b.key}>{b.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={labelStyle}>Description:</label>
        <textarea style={{...inputStyle, height: '100px'}} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div>
        <label style={labelStyle}>Date:</label>
        {/* --- 2. APPLY MIN ATTRIBUTE --- */}
        <input 
          style={inputStyle} 
          type="date" 
          value={date} 
          min={today} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label style={labelStyle}>Location:</label>
        <input style={inputStyle} type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>

      <button type="submit" style={buttonStyle}>
        Create Workshop
      </button>
    </form>
  );
};

export default CreateWorkshop;