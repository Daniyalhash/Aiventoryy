import '../src/styles/dashboardCard4.css';
import React, { useState } from 'react';


interface DashboardCard4Props {
  title: string;
  description: string;
  onRangeChange: (range: string) => void;
  bgColor: string;
  graphContent: React.ReactNode;
}

const DashboardCard4: React.FC<DashboardCard4Props> = ({ 
  title, description, onRangeChange, bgColor, graphContent 
}) => {
  const [selectedRange, setSelectedRange] = useState('Day 5'); // Default range
    const generateRangeOptions = () => {
      return ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5','Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10',
        'Day 11', 'Day 12', 'Day 13', 'Day 14', 'Day 15','Day 16', 'Day 17', 'Day 18', 'Day 19', 'Day 20',
     'Day 21', 'Day 22', 'Day 23', 'Day 24', 'Day 25','Day 26', 'Day 27', 'Day 28', 'Day 29', 'Day 30',
      ];
    };
    const handleRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newRange = event.target.value;
      setSelectedRange(newRange);
      onRangeChange(newRange); // Send the selected range to parent
    };
  return (
    <div className={`card3 ${bgColor}`}>
      <div className="cardContent2">
        <div className="cardInside">
        <h3 className="cardTitle2">{title}</h3> 

         {/* Dropdown Button for Filtering */}
         <select className="rangeDropdown" value={selectedRange} onChange={handleRangeChange}>
            {generateRangeOptions().map((range) => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>

      <div className="graphSection2">
        <p>{description}</p>
        <div className="graphShow">
        {graphContent} {/* Render the chart here */}

        </div>
      </div>
     
      </div>
     
    </div>
  );
};

export default DashboardCard4;
