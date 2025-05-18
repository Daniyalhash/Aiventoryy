// import React, { PureComponent } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// const SalesBarChart = ({ selectedRange, predictedValue, productName, category }) => {
//    // Sample data for last month's sales and predicted sales
// const data = [
//   { day: '1', lastMonthSales: 2000, predictedSales: 3400 },
//   { day: '2', lastMonthSales: 2500, predictedSales: 3600 },
//   { day: '3', lastMonthSales: 3000, predictedSales: 3800 },
//   { day: '4', lastMonthSales: 2200, predictedSales: 4000 },
//   { day: '5', lastMonthSales: 2700, predictedSales: 4200 },
//   { day: '6', lastMonthSales: 2900, predictedSales: 4400 },
//   { day: '7', lastMonthSales: 3100, predictedSales: 4600 },
//   { day: '8', lastMonthSales: 3300, predictedSales: 4800 },
//   { day: '9', lastMonthSales: 3500, predictedSales: 5000 },
//   { day: '10', lastMonthSales: 3700, predictedSales: 5200 },
//   { day: '11', lastMonthSales: 3900, predictedSales: 5400 },
//   { day: '12', lastMonthSales: 4100, predictedSales: 5600 },
//   { day: '13', lastMonthSales: 4300, predictedSales: 5800 },
//   { day: '14', lastMonthSales: 4500, predictedSales: 6000 },
//   { day: '15', lastMonthSales: 4700, predictedSales: 6200 },
//   { day: '16', lastMonthSales: 4900, predictedSales: 6400 },
//   { day: '17', lastMonthSales: 5100, predictedSales: 6600 },
//   { day: '18', lastMonthSales: 5300, predictedSales: 6800 },
//   { day: '19', lastMonthSales: 5500, predictedSales: 7000 },
//   { day: '20', lastMonthSales: 5700, predictedSales: 7200 },
//   { day: '21', lastMonthSales: 5900, predictedSales: 7400 },
//   { day: '22', lastMonthSales: 6100, predictedSales: 7600 },
//   { day: '23', lastMonthSales: 6300, predictedSales: 7800 },
//   { day: '24', lastMonthSales: 6500, predictedSales: 8000 },
//   { day: '25', lastMonthSales: 6700, predictedSales: 8200 },
//   { day: '26', lastMonthSales: 6900, predictedSales: 8400 },
//   { day: '27', lastMonthSales: 7100, predictedSales: 8600 },
//   { day: '28', lastMonthSales: 7300, predictedSales: 8800 },
//   { day: '29', lastMonthSales: 7500, predictedSales: 9000 },
//   { day: '30', lastMonthSales: 7700, predictedSales: 9200 },
// ];
// const filteredData = data.slice(0, data.findIndex(entry => `Day ${entry.day}` === selectedRange) + 1 || data.length);

//     return (
//       <ResponsiveContainer width="100%" height={230}>
//         <BarChart
//           data={filteredData}
//           margin={{
//             top: 5,
//             right: 30,
//             left: 20,
//             bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="day" label={{ value: 'Days of the Month', position: 'insideBottomRight', offset: -5 }} />
//           <YAxis label={{ value: 'Sales (Rs)', angle: -90, position: 'insideLeft', dx: -10 }} />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="lastMonthSales" fill="#ff4d4d" name="Last Month's Sales" />
//  <Bar dataKey="predictedSales" fill="#4dff4d" name="Predicted Sales" />
//         </BarChart>
//       </ResponsiveContainer>
//     );
//   }
//   export default SalesBarChart;
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

            {/* <div style={{ 
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              gap: '40px'
            }}>
              <div>
                <p style={{ margin: 0, color: '#666' }}>Last Month Revenue</p>
                <p style={{ margin: 0, fontSize: '1.5rem', color: '#ff6b6b' }}>
                  Rs {Math.round((last_month_sales || 0) * sellingPirce).toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#666' }}>Predicted Revenue</p>
                <p style={{ margin: 0, fontSize: '1.5rem', color: '#51cf66' }}>
                  Rs {Math.round((predictedValue || 0) * sellingPirce).toLocaleString()}
                </p>
              </div>
            </div> */}
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