import '../src/styles/dashboardCard4.css';
import React, { useState } from 'react';

type DashboardCard7Props = {
  title: string;
  description: string;
  
  onRangeChange?: (range: string) => void;
  bgColor?: string;
  graphContent?: React.ReactNode;
  granularity?: 'day' | 'month';
};

const DashboardCard7 = ({ 
  title, 
  description,
  onRangeChange, 
  bgColor, 
  graphContent,
  granularity = 'day'
}: DashboardCard7Props) => {
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

  const handleRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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