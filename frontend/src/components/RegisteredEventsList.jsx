import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events/myevents';
const FEEDBACK_URL = 'http://localhost:5000/api/events';

// --- NEW "EDUCROWN" STYLES ---
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
const feedbackButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  backgroundColor: 'var(--color-success)',
  color: 'var(--color-bg-white)',
  border: 'none',
  fontFamily: "inherit",
  cursor: 'pointer',
  marginTop: '1rem',
  borderRadius: '8px',
  fontWeight: 'bold',
};
const feedbackFormStyle = {
  marginTop: '1rem',
  borderTop: '1px dashed var(--color-border)',
  paddingTop: '1rem',
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
};
// --- END STYLES ---

// --- FEEDBACK COMPONENT ---
const FeedbackForm = ({ eventId, setEvents }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.post(`${FEEDBACK_URL}/${eventId}/feedback`, { rating, comment }, config);
      
      // Refresh the events list to hide the form
      const { data } = await axios.get(API_URL, config);
      setEvents(data);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <form style={feedbackFormStyle} onSubmit={handleSubmit}>
      <h4 style={{color: 'var(--educrown-blue-dark)', margin: 0}}>Leave Feedback</h4>
      {error && <p style={{color: 'var(--color-danger)'}}>{error}</p>}
      <div>
        <label style={{color: 'var(--color-text-light)', fontSize: '0.9rem'}}>Rating (1-5):</label>
        <select style={inputStyle} value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Average</option>
          <option value={2}>2 - Poor</option>
          <option value={1}>1 - Bad</option>
        </select>
      </div>
      <div>
        <label style={{color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '1rem', display: 'block'}}>Comment:</label>
        <textarea
          style={{...inputStyle, height: '80px'}}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think?"
        />
      </div>
      <button type="submit" style={{...feedbackButtonStyle, marginTop: '1rem'}}>Submit Feedback</button>
    </form>
  );
};
// --- END FEEDBACK COMPONENT ---


const RegisteredEventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const fetchMyEvents = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) {
         setError('You must be logged in to see your events.');
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

  useEffect(() => {
    fetchMyEvents();
  }, []);

  if (loading) return <p>Loading your events...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;

  return (
    <div>
      <h2 style={{color: 'var(--educrown-blue-dark)'}}>My Registered Events</h2>
      {events.length === 0 ? (
        <p>You have not registered for any events yet.</p>
      ) : (
        events.map((event) => {
          const isPast = new Date(event.date) < new Date();
          // --- THIS IS THE LOGIC FIX (from your file) ---
          // Check if the feedback array contains an object where the user._id matches
          const hasGivenFeedback = event.feedback.some(fb => fb.user === userInfo?._id || fb.user?._id === userInfo?._id);

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

              {/* --- FEEDBACK FEATURE --- */}
              {isPast && !hasGivenFeedback && (
                <FeedbackForm eventId={event._id} setEvents={setEvents} />
              )}
              {isPast && hasGivenFeedback && (
                <p style={{color: 'var(--color-success)', fontStyle: 'italic', marginTop: '1rem'}}>Thanks for your feedback!</p>
              )}
              {/* --- END FEATURE --- */}
            </div>
          )
        })
      )}
    </div>
  );
};

export default RegisteredEventsList;