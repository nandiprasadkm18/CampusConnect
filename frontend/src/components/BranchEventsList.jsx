import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// ✅ Fixed API base URL
const API_URL = 'http://localhost:5000/api/events/branch';

// --- Styles ---
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
  fontFamily: 'inherit',
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
const backLinkStyle = {
  color: 'var(--educrown-blue-light)',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '1rem',
  fontSize: '1.1rem',
  fontWeight: '600',
};
const attendeeCountStyle = {
  fontSize: '0.9rem',
  color: 'var(--color-text-light)',
  fontStyle: 'italic',
  marginTop: '1rem',
};
// --- END STYLES ---

const BranchEventsList = ({ branchName }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [registerStatus, setRegisterStatus] = useState({});

  const fetchBranchEvents = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
        setError('You must be logged in to see events.');
        setLoading(false);
        return;
      }

      setUserInfo(storedUser);
      const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

      // ✅ Correct endpoint with branch name
      const { data } = await axios.get(`${API_URL}/${branchName}`, config);
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
      setRegisterStatus((prev) => ({ ...prev, [eventId]: 'Registered!' }));
      fetchBranchEvents(); // Refresh list
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setRegisterStatus((prev) => ({ ...prev, [eventId]: message }));
    }
  };

  useEffect(() => {
    fetchBranchEvents();
  }, [branchName]);

  if (loading) return <p>Loading events for {branchName.toUpperCase()}...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;

  return (
    <div>
      <Link to="/" style={backLinkStyle}>
        &lt; Back to Home
      </Link>
      <h2
        style={{
          textTransform: 'uppercase',
          color: 'var(--educrown-blue-dark)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.5rem',
        }}
      >
        {branchName} Events
      </h2>

      {events.length === 0 ? (
        <p>No events found for this branch.</p>
      ) : (
        events.map((event) => {
          const isRegistered = event.attendees.some((a) => a._id === userInfo?._id);
          const status = registerStatus[event._id];

          return (
            <div key={event._id} style={eventCardStyle}>
              <h3 style={eventTitleStyle}>{event.title}</h3>
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
                  {isRegistered ? 'Registered' : status || 'Register'}
                </button>
              )}

              <div style={attendeeCountStyle}>
                {event.attendees.length}{' '}
                {event.attendees.length === 1 ? 'person' : 'people'} registered.
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default BranchEventsList;
