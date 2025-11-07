import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const USER_API_URL = 'http://localhost:5000/api/notifications';
const ADMIN_API_URL = 'http://localhost:5000/api/notifications/admin/all';

// --- NEW "EDUCROWN" STYLES ---
const notifCardStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '1rem',
  margin: '1rem 0',
  backgroundColor: 'var(--color-bg-white)',
  textDecoration: 'none',
  color: 'var(--color-text-dark)',
  display: 'flex', 
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.3s ease',
};
const unreadStyle = {
  ...notifCardStyle,
  backgroundColor: '#f8f9fa', // Slightly off-white for unread
  borderColor: 'var(--educrown-blue-light)',
  boxShadow: '0 0 10px rgba(0, 86, 179, 0.1)',
};
const clearButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  backgroundColor: 'transparent',
  color: 'var(--educrown-blue-light)',
  border: '1px solid var(--educrown-blue-light)',
  fontFamily: "inherit",
  cursor: 'pointer',
  marginBottom: '1rem',
  borderRadius: '8px',
};
const deleteButtonStyle = {
  backgroundColor: 'transparent',
  color: 'var(--color-danger)',
  border: '1px solid var(--color-danger)',
  padding: '0.3rem 0.6rem',
  fontSize: '0.7rem',
  cursor: 'pointer',
  marginLeft: '1rem',
  borderRadius: '8px',
};
const contentStyle = {
  flexGrow: 1,
  paddingRight: '1rem',
};
// --- End Styles ---

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      if (!userInfo) {
          setError('You are not logged in.');
          setLoading(false);
          return;
      }
      
      const isUserAdmin = userInfo.role === 'admin';
      setIsAdmin(isUserAdmin);

      const fetchURL = isUserAdmin ? ADMIN_API_URL : USER_API_URL;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.get(fetchURL, config);
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.put(`${USER_API_URL}/readall`, {}, config); 
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification? This action is permanent.")) {
        return;
    }
    try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await axios.delete(`${USER_API_URL}/${id}`, config); 
        
        setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>;

  return (
    <div>
      <h2 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>
        {isAdmin ? 'ALL SYSTEM NOTIFICATIONS' : 'Notifications'}
      </h2>
      
      <button onClick={handleMarkAllRead} style={clearButtonStyle}>
        Mark My Notifications As Read
      </button>

      {notifications.length === 0 ? (
        <p style={{color: 'var(--color-text-light)'}}>You have no notifications.</p>
      ) : (
        notifications.map((notif) => (
          <div 
            key={notif._id} 
            style={notif.read ? notifCardStyle : unreadStyle}
          >
            <div style={contentStyle}>
                <p style={{margin: 0}}>
                    {isAdmin && notif.user ? `[Sent to: ${notif.user.username}] - ` : ''} 
                    {notif.message}
                </p>
                <small style={{color: 'var(--color-text-light)'}}>
                  {new Date(notif.createdAt).toLocaleString()}
                </small>
            </div>
            
            {isAdmin && (
                <button
                    style={deleteButtonStyle}
                    onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        handleDelete(notif._id);
                    }}
                >
                    Delete
                </button>
            )}
            
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;