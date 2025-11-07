import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/workshops'; // <-- CHANGED

// --- Styles (Identical to EventsList) ---
const eventCardStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '1.5rem',
  margin: '1rem 0',
  backgroundColor: 'var(--color-bg-white)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};
const eventTitleStyle = {
  color: 'var(--educrown-blue-dark)',
  margin: '0 0 0.5rem 0',
};
const registerButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  backgroundColor: 'var(--educrown-blue-light)',
  color: 'var(--color-bg-white)',
  border: 'none',
  fontFamily: "inherit",
  cursor: 'pointer',
  marginTop: '1rem',
  borderRadius: '8px',
  fontWeight: 'bold',
};
const registeredStyle = {
  ...registerButtonStyle,
  backgroundColor: 'var(--color-bg-light)',
  color: 'var(--color-text-light)',
  border: '1px solid var(--color-border)',
  cursor: 'not-allowed',
};
const branchTagStyle = {
    color: 'var(--educrown-blue-dark)',
    backgroundColor: 'rgba(212, 175, 55, 0.1)', 
    border: '1px solid var(--educrown-gold)', 
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    display: 'inline-block',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginRight: '1rem'
};
const attendeeCountStyle = {
  fontSize: '0.9rem',
  color: 'var(--color-text-light)',
  fontStyle: 'italic',
  marginTop: '1rem',
};
// --- END STYLES ---


const WorkshopList = () => { // <-- CHANGED
  const [workshops, setWorkshops] = useState([]); // <-- CHANGED
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [registerStatus, setRegisterStatus] = useState({});

  const handleRegister = async (workshopId) => { // <-- CHANGED
    if (registerStatus[workshopId]) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`http://localhost:5000/api/workshops/${workshopId}/register`, {}, config); // <-- CHANGED
      setRegisterStatus(prev => ({ ...prev, [workshopId]: 'Registered!' }));
      fetchWorkshops(); 
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setRegisterStatus(prev => ({ ...prev, [workshopId]: message }));
    }
  };

  const fetchWorkshops = async () => { // <-- CHANGED
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
         setError('You must be logged in to see workshops.'); // <-- CHANGED
         setLoading(false);
         return;
      }
      setUserInfo(storedUser); 

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(API_URL, config);
      setWorkshops(data); // <-- CHANGED
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workshops'); // <-- CHANGED
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkshops(); // <-- CHANGED
  }, []);

  if (loading) return <p>Loading workshops...</p>; // <-- CHANGED
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;

  return (
    <div>
      <h1 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>All Workshops</h1> {/* <-- CHANGED */}
      {workshops.length === 0 ? ( // <-- CHANGED
        <p>No workshops found.</p> // <-- CHANGED
      ) : (
        workshops.map(workshop => { // <-- CHANGED
          const isRegistered = workshop.attendees.some(a => a._id === userInfo?._id);
          const status = registerStatus[workshop._id];
          
          return (
            <div key={workshop._id} style={eventCardStyle}>
              <div>
                <span style={branchTagStyle}>{workshop.branch}</span>
              </div>
              <h3 style={{...eventTitleStyle, marginTop: '1rem'}}>{workshop.title}</h3>
              <p><strong>Date:</strong> {new Date(workshop.date).toLocaleDateString()}</p> 
              <p><strong>Location:</strong> {workshop.location}</p>
              <p>{workshop.description}</p>
              <small>Posted by: {workshop.creator?.username || 'Unknown'}</small>
              
              {userInfo && userInfo.role === 'user' && (
                <button
                  style={isRegistered || status ? registeredStyle : registerButtonStyle}
                  onClick={() => handleRegister(workshop._id)}
                  disabled={isRegistered || !!status}
                >
                  {isRegistered ? 'Registered' : (status || 'Register')}
                </button>
              )}
              <div style={attendeeCountStyle}>
                {workshop.attendees.length} 
                {workshop.attendees.length === 1 ? ' person' : ' people'} registered.
              </div>
            </div>
          )
        })
      )}
    </div>
  );
};

export default WorkshopList; // <-- CHANGED