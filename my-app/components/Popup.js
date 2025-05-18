import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '@/styles/popup.css';

const Popup = ({head, title, content, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {/* Header with title and close button */}
        <div className="popup-header">
          <h2>{head}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Body with dynamic content */}
        <div className="popup-body">
            <div className='popup-body-heading'>
            <h2>{title}</h2>
            </div>
          {content}
        </div>
      </div>
    </div>
  );
};

export default Popup;