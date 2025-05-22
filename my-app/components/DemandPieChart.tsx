import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PredictedDemandChart = ({ selectedRange, predictedValue}) => {
  // Example historical data (you can replace this with actual API data)
  const historicalData = [
    { date: '2023-04-01', sales: 50 },
    { date: '2023-04-02', sales: 75 },
    { date: '2023-04-03', sales: 60 },
    { date: '2023-04-04', sales: 80 },
    { date: '2023-04-05', sales: 90 },
    { date: '2023-04-06', sales: 100 },
    { date: '2023-04-07', sales: 110 },
  ];

  // Filter data based on selected range (e.g., "Day 5")
  const filteredData = (() => {
    if (!selectedRange || selectedRange === 'All') return historicalData;

    const rangeNumberMatch = selectedRange.match(/\d+/);
    if (!rangeNumberMatch) return historicalData;

    const daysToShow = parseInt(rangeNumberMatch[0], 10);
    return historicalData.slice(-daysToShow); // Show the last N days
  })();

  // Create prediction point
  const predictionPoint = {
    date: 'Next Day (Predicted)',
    sales: predictedValue,
  };

  // Combine historical data with prediction point
  const chartData = [...filteredData, predictionPoint];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;
    const isPrediction = dataPoint.date.includes('Predicted');

    return (
      <div className="custom-tooltip">
        <p className="tooltip-date">{label}</p>
        <p className={`tooltip-value ${isPrediction ? 'prediction' : 'historical'}`}>
          Sales: <strong>{payload[0].value.toLocaleString()}</strong>
        </p>
        {isPrediction && <p className="tooltip-note">(Projected Value)</p>}
      </div>
    );
  };

  return (
    <div className="demand-chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#555' }}
            label={{ value: 'Timeline', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            label={{ value: 'Sales', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#555' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Historical Data Line */}
          <Line
            name="Historical Sales"
            type="monotone"
            dataKey="sales"
            stroke="#4CAF50"
            strokeWidth={3}
            dot={{ fill: '#2E7D32', r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Prediction Line */}
          <Line
            name="Predicted Sales"
            type="linear"
            dataKey="sales"
            data={[chartData[chartData.length - 2], predictionPoint]} // Connect last historical point to prediction
            stroke="#FF5252"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{
              r: 6,
              fill: '#FF5252',
              strokeWidth: 2,
              stroke: '#fff',
            }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <style jsx>{`
        .demand-chart {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .custom-tooltip {
          background: white;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .tooltip-date {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .tooltip-value.historical {
          color: #4CAF50;
        }
        .tooltip-value.prediction {
          color: #FF5252;
        }
        .tooltip-note {
          font-size: 0.8em;
          color: #FF5252;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default PredictedDemandChart;