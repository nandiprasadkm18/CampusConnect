import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// --- "EDUCROWN" STYLES (No change) ---
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
  backgroundColor: 'var(--educrown-blue-light)', // Blue button
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

// --- DROPDOWN DATA ---
const branches = ['cse', 'ise', 'aiml', 'ec', 'eee', 'civil', 'mechanical'];
const years = ['1', '2', '3', '4'];
const semesterMap = {
  '1': ['1', '2'],
  '2': ['3', '4'],
  '3': ['5', '6'],
  '4': ['7', '8'],
};
// --- END DATA ---

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  
  const [availableSemesters, setAvailableSemesters] = useState([]); 

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (year) {
      setAvailableSemesters(semesterMap[year]);
      setSemester(''); 
    } else {
      setAvailableSemesters([]);
      setSemester('');
    }
  }, [year]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
        usn,
        branch,
        year,
        semester
      });

      console.log('Registered successfully:', data);
      setSuccess('Registration successful! You can now log in.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div style={formStyle}> 
        <h2 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>Registration Complete!</h2>
        <p style={{ color: 'var(--color-success)', textAlign: 'center' }}>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>Register</h2>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      
      <div>
        <label style={labelStyle}>Username:</label>
        <input
          style={inputStyle}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>USN:</label>
        <input
          style={inputStyle}
          type="text"
          value={usn}
          onChange={(e) => setUsn(e.target.value.toUpperCase())}
          placeholder="e.g., 1AB21CS001"
          required
        />
      </div>
      
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
        <label style={labelStyle}>Branch</label>
        <select style={inputStyle} value={branch} onChange={(e) => setBranch(e.target.value)} required>
          <option value="">Select Branch</option>
          {branches.map(b => (
            <option key={b} value={b}>{b.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Year</label>
        <select style={inputStyle} value={year} onChange={(e) => setYear(e.target.value)} required>
          <option value="">Select Year</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Semester</label>
        <select 
          style={inputStyle} 
          value={semester} 
          onChange={(e) => setSemester(e.target.value)} 
          required
          disabled={!year} 
        >
          <option value="">Select Semester</option>
          {availableSemesters.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Password:</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // <-- THIS IS THE FIX
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Confirm Password:</label>
        <input
          style={inputStyle}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" style={buttonStyle}>
        Register
      </button>
    </form>
  );
};

export default Register;