'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import '@/styles/UserProfileCard.css';


const DataCard = ({ userId, email }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isRetrainPopupOpen, setIsRetrainPopupOpen] = useState(false);

  const [userDetails, setUserDetails] = useState(null);
  //   const [tempUser, setTempUser] = useState({ ...user });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // Optional: use in UI

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_user_details/`, {
          params: { user_id: userId }
        });
        console.log(message)
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setMessage({ text: 'Failed to load user data', type: 'error' });

      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId, message]);

console.log("userDetails", userDetails);
  const handleConfirmClick = () => {
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };
   const handleOpenRetrainPopup = () => {
    setIsRetrainPopupOpen(true);
  };
  const handleCloseRetrainPopup = () => {
    setIsRetrainPopupOpen(false);
  };
  // console.log("f", userDetails?.email);
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
const handleConfirmRetrain = () => {
    setIsRetrainPopupOpen(false);
    // Redirect to model retrain page or perform retrain logic
   window.location.href = `/signup?step=3&userId=${userId}`;
  };

  return (
    <div className="profile-edit-container">
      {isLoading && <div className="loading-overlay">Loading...</div>}

      <div className="profile-header">
        <div className="avatar-section">
          <h2 className="profile-title">Data</h2>
          <div className="avatar-placeholder">
            <button
              className="edit-button"
              onClick={() => handleConfirmClick()}

              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faDatabase} />
              Upload Data         
               </button>
                  <button
              className="edit-button"
                  onClick={handleOpenRetrainPopup}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faDatabase} />
              Update Model         
               </button>
          </div>


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
            <h3>Confirm Reset</h3>
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
      
      {/* Retrain Popup */}
      {isRetrainPopupOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Model Retraining</h3>
            <p>
              This will trigger a model retrain process.
              Please note that this may take several minutes.
            </p>
            <div className="modal-actions">
              <button onClick={handleCloseRetrainPopup} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleConfirmRetrain} className="confirm-button">
                Start Retrain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCard;