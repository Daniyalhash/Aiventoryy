'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserAvatar from "@/components/UserAvatar"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import '@/Styles/UserProfileCard.css'
import { useUser } from './UserContext';
// Email validation function
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
const UserProfileCard = ({ userId }) => {
    const { user: contextUser, setUser: setContextUser } = useUser(); // Get user from context

    const [tempUser, setTempUser] = useState({ 
        username: contextUser?.username || '',
        shopname:contextUser?.shopname || '', 
        email: contextUser?.email || '' 
      });
  const [isEditing, setIsEditing] = useState(false);
//   const [tempUser, setTempUser] = useState({ ...user });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/aiventory/get-user-details/`, {
          params: { user_id: userId }
        });
        setContextUser(response.data);
        setTempUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setMessage({ text: 'Failed to load user data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    if (!tempUser.username.trim()) {
      setMessage({ text: 'Username is required', type: 'error' });
      return;
    }
 if (!tempUser.shopname.trim()) {
      setMessage({ text: 'shopname is required', type: 'error' });
      return;
    }
    if (!validateEmail(tempUser.email)) {
      setMessage({ text: 'Please enter a valid email', type: 'error' });
      return;
    }

    try {
    console.log("Sending data:", tempUser);
    setIsLoading(true);

    setMessage({ text: '', type: '' }); // Clear previous messages

      const { data: response } = await axios.post('http://127.0.0.1:8000/aiventory/update-user/', {
        user_id: userId,
        username: tempUser.username,
        shopname:tempUser.shopname,
        email: tempUser.email
      });
  
      if (response.success) {
        setContextUser(response.user);
        if (window.updateNavbarUser) window.updateNavbarUser();
        setIsEditing(false);
        setMessage({ text: response.message, type: 'success' });
      } else {
        setMessage({ text: response.message || 'Update failed', type: 'error' });
      }
  
    }catch (error) {
        const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Failed to update profile';
        setMessage({ text: errorMsg, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
  

  return (
    <div className="profile-edit-container">
          {isLoading && <div className="loading-overlay">Loading...</div>}

      <div className="profile-header">
        <div className="avatar-section">
        <UserAvatar name={contextUser?.username} size="xlarge" />
        <h2 className="profile-title">{contextUser?.username}</h2>
        <button 
            className="edit-button"
            onClick={() => {
              setIsEditing(!isEditing);
              setMessage({ text: '', type: '' });
              if (isEditing) setTempUser(contextUser || { username: '', email: '' });
            }}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={isEditing ? faTimes : faUserEdit} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-details">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={tempUser.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
             <div className="form-group">
              <label>Shop name</label>
              <input
                type="text"
                name="shopname"
                value={tempUser.shopname}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={tempUser.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
        
            <button 
              className="save-button" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (
                <>
                  <FontAwesomeIcon icon={faSave} /> Save Changes
                </>
              )}
            </button>
            {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
          </div>
        ) : (
          <div className="info-display">
            <div className="info-row">
              <span className="info-label">User Name:</span>
              <span className="info-value">{contextUser?.username}</span>
            </div>
              <div className="info-row">
              <span className="info-label">Shop Name:</span>
              <span className="info-value">{contextUser?.shopname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{contextUser?.email || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;