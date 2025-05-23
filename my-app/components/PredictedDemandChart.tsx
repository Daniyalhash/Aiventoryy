import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area
} from 'recharts';

interface PredictedDemandChartProps {
  selectedRange?: string;
  predictedValue: number | null;  // Update to match Cards3Props type
}

const PredictedDemandChart: React.FC<PredictedDemandChartProps> = ({ selectedRange, predictedValue }) => {
  // Function to generate random daily demand data based on predicted value
  const generateMonthlyData = (totalDemand: number) => {
    if (!totalDemand) return [];
    
    const daysInMonth = 30; // or you could get actual days in current month
    const baseDailyDemand = Math.floor(totalDemand / daysInMonth);
    const fluctuationRange = Math.ceil(baseDailyDemand * 0.3); // ±30% fluctuation
    
    let remainingDemand = totalDemand;
    const dailyData = [];
    
    // Generate data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      let dailyDemand;
      
      if (day === daysInMonth) {
        // Last day gets whatever is remaining
        dailyDemand = remainingDemand;
      } else {
        // Random fluctuation around average
        const fluctuation = Math.floor(Math.random() * fluctuationRange * 2) - fluctuationRange;
        dailyDemand = baseDailyDemand + fluctuation;
        dailyDemand = Math.max(0, dailyDemand); // Ensure not negative
        dailyDemand = Math.min(dailyDemand, remainingDemand); // Don't exceed remaining
      }
      
      remainingDemand -= dailyDemand;
      
      // Add some variance to upper/lower bounds
      const lowerBound = Math.round(dailyDemand * 0.9);
      const upperBound = Math.round(dailyDemand * 1.1);
      
      dailyData.push({
        day: day.toString(),
        predictedDemand: dailyDemand,
        lowerBound,
        upperBound
      });
    }
    
    return dailyData;
  };

  const chartData = predictedValue != null ? generateMonthlyData(predictedValue) : [];
  const filteredData = selectedRange 
    ? chartData.slice(0, parseInt(selectedRange.replace("Day ", "")))
    : chartData;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
     
      
      {predictedValue ? (
        <>
      
          
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis 
                  dataKey="day" 
                  fontSize={12} 
                  label={{ value: 'Day of Month', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  label={{ 
                    value: 'Daily Demand', 
                    angle: -90, 
                    position: 'insideLeft',
                    dx: 0,
                    dy: 50
                  }} 
                  fontSize={12} 
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="predictedDemand" 
                  name="Daily Demand in Days" 
                  stroke="#17412D" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="upperBound" 
                  fill="#9FE870" 
                  stroke="none" 
                  fillOpacity={0.3} 
                  name="Expected Range"
                />
                <Area 
                  type="monotone" 
                  dataKey="lowerBound" 
                  fill="#9FE870" 
                  stroke="none" 
                  fillOpacity={0.3} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%'
        }}>
          <p style={{ color: '#666' }}>No prediction available yet</p>
        </div>      )}
    </div>
  );
};

export default PredictedDemandChart;