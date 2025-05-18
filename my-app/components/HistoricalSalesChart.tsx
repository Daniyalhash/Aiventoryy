import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const HistoricalSalesChart = ({ historicalData, predictedValue, selectedRange, selectedMonth }) => {
  // Validate historical data
  if (!Array.isArray(historicalData) || historicalData.length === 0) {
    return (
      <div className="data-error">
        <p>No historical sales data available</p>
        <p>Please check your data sources</p>
      </div>
    );
  }

  // Filter data based on selected range
  const filteredData = (() => {
    if (!selectedRange || selectedRange === 'All Months') return historicalData;

    // Extract the numeric part of the range (e.g., "Day 15" -> 15)
    const rangeNumberMatch = selectedRange.match(/\d+/);
    if (!rangeNumberMatch) return historicalData; // Default to all data if no number is found

    const monthsToShow = parseInt(rangeNumberMatch[0], 10);
    return historicalData.slice(-monthsToShow); // Show the last N months
  })();

  // Process historical data
  const processedHistorical = filteredData.map((item) => ({
    ...item,
    dataType: 'historical',
    date: item.date || 'Unknown Date', // Ensure date exists
  }));

  // Create prediction point
  const predictionPoint = {
    date: selectedMonth ? `${selectedMonth} (Predicted)` : 'Next Month (Predicted)',
    sales: predictedValue,
    dataType: 'prediction',
  };

  // Combine data - prediction always comes last
  const chartData = [...processedHistorical, predictionPoint];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;
    const isPrediction = dataPoint.dataType === 'prediction';

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
    <div className="sales-trend-chart">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
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

          {/* Historical Data Area */}
          <Area
            name="Historical Sales"
            type="monotone"
            dataKey="sales"
            stroke="#4CAF50"
            fill="rgba(76, 175, 80, 0.3)" // Light green fill for historical data
            dot={{ fill: '#2E7D32', r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Prediction Line */}
          <Area
            name="Predicted Sales"
            type="linear"
            dataKey="sales"
            stroke="#FF5252"
            fill="none" // No fill for prediction line
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
        </AreaChart>
      </ResponsiveContainer>

      <style jsx>{`
        .sales-trend-chart {
          background: white;
          border-radius: 8px;
        }
        .data-error {
          padding: 20px;
          text-align: center;
          color: #666;
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

export default HistoricalSalesChart;