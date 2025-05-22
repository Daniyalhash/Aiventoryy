
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SalesBarChart = ({ 
  selectedRange, 
  predictedValue, 
  last_month_sales, // Add this prop for last month's total sales
  sellingPirce,   // Add this prop for the product's selling price
  productName, 
  category 
}) => {
  // Function to generate daily sales data
  const generateSalesData = (totalSales) => {
    if (!totalSales) return Array(30).fill(0);
    console.log("sellingPirce",sellingPirce)
    console.log("last_month_sales",last_month_sales)

    const daysInMonth = 30;
    const baseDailySales = Math.floor(totalSales / daysInMonth);
    const fluctuationRange = Math.ceil(baseDailySales * 0.4); // ±40% fluctuation
    
    let remainingSales = totalSales;
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      let dailySales;
      
      if (day === daysInMonth) {
        dailySales = remainingSales;
      } else {
        const fluctuation = Math.floor(Math.random() * fluctuationRange * 2) - fluctuationRange;
        dailySales = baseDailySales + fluctuation;
        dailySales = Math.max(0, dailySales);
        dailySales = Math.min(dailySales, remainingSales);
      }
      
      remainingSales -= dailySales;
      dailyData.push(Math.round(dailySales * sellingPirce)); // Convert to revenue
    }
    
    return dailyData;
  };

  // Generate data for both months
  const lastMonthDailyRevenue = generateSalesData(last_month_sales);
  const predictedDailyRevenue = generateSalesData(predictedValue);

  // Combine into chart data format
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: (i + 1).toString(),
    last_month_sales: lastMonthDailyRevenue[i],
    predictedSales: predictedDailyRevenue[i]
  }));
  // Safely handle range selection
  const dayNumber = parseInt(selectedRange?.replace("Day ", "") || "30", 10);
  const filteredData = chartData.slice(0, Math.min(dayNumber, 30));
    return (
      <div style={
        {  height: '100%',
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
 <h3>{productName} Sales in {category}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis 
                  dataKey="day" 
                  label={{  position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  label={{ 
                    value: 'Revenue (Rs)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    dx: 0,
                    dy: 50
                  }}
                />
                <Tooltip 
                formatter={(value, name) => [
                  `Rs ${value.toLocaleString()}`, 
                  name === "lastMonthSales" ? 'Last Month' : 'Predicted'
                ]}
                labelFormatter={(label) => `Day ${label}`}
              />
                <Legend />
                <Bar 
                  dataKey="last_month_sales" 
                  name="Last Month" 
                  fill="#ff6b6b" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="predictedSales" 
                  name="Predicted" 
                  fill="#51cf66" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
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
        </div>
      )}
    </div>
    );
  };
  
  export default SalesBarChart;