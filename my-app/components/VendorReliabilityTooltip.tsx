import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

// Somewhere inside your component
const VendorReliabilityTooltip = () => {
  return (
    <div className="tooltip-container">
      <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
      <div className="tooltip-text">
        <strong>How We Calculate:</strong>
        <ul>
          <li>✅ On Time (≤24 hours): 100 score</li>
          <li>❌ Each extra day late: -5 score</li>
          <li>🚫 Minimum score: 0</li>
        </ul>
        <small>e.g., 3 days late → 85 score</small>
      </div>
    </div>
  );
};
export default VendorReliabilityTooltip;