import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Area
} from 'recharts';
import { FaChartLine } from 'react-icons/fa';

const SalesTrendChart = ({ data, fallbackMessage }) => {
  if (!data || data.length === 0 || fallbackMessage) {
    return (
      <div className="chart-fallback">
        <FaChartLine size={48} className="fallback-icon" />
        <p>{fallbackMessage || "No sales data available"}</p>
      </div>
    );
  }

  // Calculate average for reference line
  const averageSales = data.reduce((sum, entry) => sum + entry.total_sales, 0) / data.length;

  return (
    <div className="sales-trend-container">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: "#666", fontSize: 14 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: "#666", fontSize: 14 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
            <Legend />
            <ReferenceLine 
            y={averageSales} 
            label={{
              value: `Avg ${averageSales.toFixed(0)}`, 
              position: 'bottom',
              fill: '#666',
              fontSize: 16
            }}
            stroke="#888" 
            strokeDasharray="5 5" 
          />
          <Area 
            type="monotone" 
            dataKey="total_sales" 
            fill="url(#colorSales)" 
            fillOpacity={1} 
            name="Total Sales"
          />
            <Line 
             type="monotone" 
            dataKey="total_sales" 
            stroke="#4CAF50" 
            strokeWidth={3} 
            dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#fff', stroke: '#4CAF50', strokeWidth: 2 }}
            name="Total Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <span className="data-info">Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default SalesTrendChart;