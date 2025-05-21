'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faDatabase, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import '@/Styles/UserProfileCard.css'
import { useRouter } from 'next/navigation';
const DataCard = ({ userId ,email}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
console.log("getting email",email)
  const [isEditing, setIsEditing] = useState(false);
  //   const [tempUser, setTempUser] = useState({ ...user });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/aiventory/get-user-details/`, {
          params: { user_id: userId }
        });
        console.log(response.data);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setMessage({ text: 'Failed to load user data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);


  const handleConfirmClick = () => {
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };
console.log("f", userDetails?.email);
const handleConfirmReset = () => {
  setIsPopupOpen(false);
  const targetEmail = email || userDetails?.email;

  if (!targetEmail) {
    alert("Email not found.");
    return;
  }
  window.location.href = `/signup?step=2&userId=${userId}&email=${encodeURIComponent(targetEmail)}`; 
  // router.push(`/signup?step=2&userId=${userId}&email=${encodeURIComponent(email)}`);
};


  return (
    <div className="profile-edit-container">
      {isLoading && <div className="loading-overlay">Loading...</div>}

      <div className="profile-header">
        <div className="avatar-section">
          <h2 className="profile-title">Data</h2>
          <button
            className="edit-button"
            onClick={() => handleConfirmClick()}

            disabled={isLoading}
          >
            <FontAwesomeIcon icon={isEditing ? faTimes : faDatabase} />
            {isEditing ? 'Cancel' : 'Upload Data'}
          </button>
        </div>
      </div>

      <div className="profile-details">

        <div className="info-display">
          <div className="info-row">
            <span className="info-label">Data File Name:</span>
            <span className="info-value">{userDetails?.dataset.dataset_name || 'No Data Uploaded'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Last Upload Date:</span>
            <span className="info-value">{userDetails?.dataset.upload_date_pretty
              || 'Never'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Model Trained Status:</span>
            <span className="info-value">{userDetails?.model_trained ? 'Yes' : 'No'}</span>
          </div>
        </div>

      </div>
      {isPopupOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Confirm Reset</h3>
            <p>
              This will erase all current data and start fresh.
              It may take 5–7 minutes to retrain models.
            </p>
            <div className="modal-actions">
              <button onClick={handleClosePopup} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleConfirmReset} className="confirm-button">
                Yes, Confirm
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCard;