import Link from 'next/link';
import '../src/styles/dashboardCard4.css';
import React, { useState } from 'react';

const DashboardCard7 = ({ 
  title, 
  value, 
  description,
  onRangeChange, 
  link, 
  bgColor, 
  graphContent,
  granularity = 'day' // Default to 'day', but can pass 'month'
}) => {
  // State for selected range
  const [selectedRange, setSelectedRange] = useState(
    granularity === 'month' ? 'Month 3' : 'Day 5'
  );

  // Generate range options based on granularity
  const generateRangeOptions = () => {
    if (granularity === 'month') {
      return ['All Months', 'Month 3', 'Month 6', 'Month 12'];
    } else {
      return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    }
  };

  const handleRangeChange = (event) => {
    const newRange = event.target.value;
    setSelectedRange(newRange);
    if (onRangeChange) onRangeChange(newRange);
  };

  return (
    <div className={`card3 ${bgColor}`}>
      <div className="cardContent2">
        <div className="cardInside">
          <h3 className="cardTitle2">{title}</h3> 
          {/* Range Dropdown */}
          <select 
            className="rangeDropdown" 
            value={selectedRange} 
            onChange={handleRangeChange}
          >
            {generateRangeOptions().map((range) => (
              <option key={range} value={range}>
                {granularity === 'month' ? 
                  (range === 'All Months' ? range : `Last ${range}`) : 
                  range}
              </option>
            ))}
          </select>
        </div>

        <div className="graphSection2">
          <p>{description}</p>
          <div className="graphShow">
            {graphContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard7;