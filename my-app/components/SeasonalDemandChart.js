import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  ReferenceLine
} from "recharts";
import { Skeleton } from '@mui/material';

const SeasonalDemandChart = ({
  historicalData,
  seasonalAverages,
  selectedSeason,
  isLoading
}) => {
  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" height={250} />;
  }

  if (!seasonalAverages || historicalData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No seasonal data available. Please make a prediction first.
      </div>
    );
  }

  // Prepare data for the selected season
  const seasonMonths = seasonalAverages[selectedSeason]?.months || [];
  const seasonHistoricalData = historicalData
    .filter(item => seasonMonths.includes(item.month))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const seasonAverage = seasonalAverages[selectedSeason]?.average || 0;

  // Combine data for the chart
  const chartData = seasonHistoricalData.map(item => ({
    date: item.date,
    sales: item.sales,
    average: seasonAverage,
    month: item.month,
    season: item.season
  }));

  // Get season color
  const getSeasonColor = (season) => {
    switch (season.toLowerCase()) {
      case 'winter': return '#4E79A7';
      case 'spring': return '#59A14F';
      case 'summer': return '#EDC948';
      case 'fall': return '#E15759';
      default: return '#8884d8';
    }
  };

  const seasonColor = getSeasonColor(selectedSeason);

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold capitalize">
        {selectedSeason} Season Analysis
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={seasonColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={seasonColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleString('default', { month: 'short' })}
          />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'sales') return [`${value} units`, 'Actual Sales'];
              if (name === 'average') return [`${value} units`, 'Season Average'];
              return [value, name];
            }}
            labelFormatter={(date) => `Month: ${new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke={seasonColor} 
            fill="url(#colorSales)" 
            name="Actual Sales"
          />
          <ReferenceLine 
            y={seasonAverage} 
            stroke="#FF6B6B" 
            strokeDasharray="3 3" 
            label={`Avg: ${seasonAverage.toFixed(0)}`}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="text-sm text-gray-600 text-center">
        Showing data for {selectedSeason} months: {seasonMonths.map(m => 
          new Date(2000, m-1, 1).toLocaleString('default', { month: 'short' }))
          .join(', ')}
      </div>
    </div>
  );
};

export default SeasonalDemandChart;