import React from "react";
import "@/styles/stats-cards.css";
import { FaBoxes, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";

const StatsCards = ({ 
  totalVendorSize, 
  totalVendorLinks, 
  totalVendorNotLinks 
}) => {
  return (
    <div className="stats-grid">
      {/* Card 1: Total Dataset Size */}
      <div className="stats-card stats-card-total">
        <FaBoxes className="stats-card-icon" />
        <h3 className="stats-card-title">Total Vendors</h3>
        <p className="stats-card-value">{totalVendorSize}</p>
        <p className="stats-card-subtext">Across all categories</p>
      </div>

      {/* Card 2: Unique Products */}
      <div className="stats-card stats-card-unique">
        <FaBoxOpen className="stats-card-icon" />
        <h3 className="stats-card-title">Vendors Links With Products</h3>
        <p className="stats-card-value">{totalVendorLinks}</p>
        <p className="stats-card-subtext">Distinct items in stock</p>
      </div>

      {/* Card 3: Expired Products */}
      <div className="stats-card stats-card-expired">
        <FaExclamationTriangle className="stats-card-icon" />
        <h3 className="stats-card-title">Not Linked With Products</h3>
        <p className="stats-card-value">{totalVendorNotLinks}</p>
        <p className="stats-card-subtext">Require attention</p>
      </div>
    </div>
  );
};

export default StatsCards;