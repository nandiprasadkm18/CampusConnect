import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API URL now fetches ALL events
const API_URL = 'http://localhost:5000/api/events';

// --- Styles (no changes) ---
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
const deleteButtonStyle = {
  padding: '0.4rem 0.8rem',
  fontSize: '0.8rem',
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
  border: '1px solid var(--color-danger)',
  borderRadius: '6px',
  cursor: 'pointer',
  marginLeft: '1rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  transition: 'all 0.2s ease',
};
// --- END STYLES ---


const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [registerStatus, setRegisterStatus] = useState({});

  const fetchEvents = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('You must be logged in to see events.');
        setLoading(false);
        return;
      }
      setUserInfo(storedUser);

      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
      const { data } = await axios.get(API_URL, config);
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (registerStatus[eventId]) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, config);
      setRegisterStatus(prev => ({ ...prev, [eventId]: 'Registered!' }));
      fetchEvents(); // Refresh list to update count and button
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setRegisterStatus(prev => ({ ...prev, [eventId]: message }));
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, config);
      setEvents(prev => prev.filter(event => event._id !== eventId));
      alert('Event deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;

  return (
    <div>
      <h1 style={{ textAlign: 'center', color: 'var(--educrown-blue-dark)' }}>All Events</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((event, index) => {
          const isRegistered = event.attendees.some(a => a._id === userInfo?._id);
          const status = registerStatus[event._id];

          return (
            <div
              key={event._id}
              className="animate-fade-in-up hover-scale"
              style={{
                ...eventCardStyle,
                animationDelay: `${index * 0.1}s`
              }}
            >

              <div>
                <span style={branchTagStyle}>{event.branch}</span>
              </div>

              <h3 style={{ ...eventTitleStyle, marginTop: '1rem' }}>{event.title}</h3>
              <p>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>

              <p>
                <strong>Location:</strong> {event.location}
              </p>
              <p>{event.description}</p>
              <small>Posted by: {event.creator?.username || 'Unknown'}</small>

              {userInfo && userInfo.role === 'user' && (
                <button
                  style={isRegistered || status ? registeredStyle : registerButtonStyle}
                  onClick={() => handleRegister(event._id)}
                  disabled={isRegistered || !!status}
                >
                  {isRegistered ? 'Registered' : (status || 'Register')}
                </button>
              )}

              {userInfo && userInfo.role === 'admin' && (
                <button
                  style={deleteButtonStyle}
                  onClick={() => handleDelete(event._id)}
                >
                  ⚠️ DELETE EVENT
                </button>
              )}

              <div style={attendeeCountStyle}>
                {event.attendees.length}
                {event.attendees.length === 1 ? ' person' : ' people'} registered.
              </div>

            </div>
          )
        })
      )}
    </div>
  );
};

export default EventsList;