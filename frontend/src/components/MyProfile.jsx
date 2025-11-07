import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL_GET = 'http://localhost:5000/api/users/profile';

// --- Styles ---
const profileContainerStyle = {
  width: '100%',
};
const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 2fr', // Label and Value
  gap: '1.5rem',
};
const labelStyle = {
  color: 'var(--color-text-light)', 
  textTransform: 'uppercase',
  fontSize: '0.9rem',
  fontWeight: '600',
  textAlign: 'right',
  paddingTop: '0.25rem',
};
const valueStyle = {
  color: 'var(--color-text-dark)',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  borderBottom: '1px solid var(--color-border)',
  paddingBottom: '0.5rem',
  textAlign: 'left',
};
// --- END STYLES ---

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const { data } = await axios.get(API_URL_GET, config);
        setProfile(data);
      } catch (error) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div style={profileContainerStyle}>
      <h2 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>
        My Profile
      </h2>
      
      <div style={infoGridStyle}>
        <span style={labelStyle}>Username:</span>
        <span style={valueStyle}>{profile.username}</span>

        <span style={labelStyle}>Email:</span>
        <span style={valueStyle}>{profile.email}</span>

        <span style={labelStyle}>USN:</span>
        <span style={valueStyle}>{profile.profile.usn || 'Not set'}</span>

        <span style={labelStyle}>Branch:</span>
        <span style={{...valueStyle, textTransform: 'uppercase'}}>{profile.profile.branch || 'Not set'}</span>

        <span style={labelStyle}>Year:</span>
        <span style={valueStyle}>{profile.profile.year || 'Not set'}</span>

        <span style={labelStyle}>Semester:</span>
        <span style={valueStyle}>{profile.profile.semester || 'Not set'}</span>
      </div>
    </div>
  );
};

export default MyProfile;