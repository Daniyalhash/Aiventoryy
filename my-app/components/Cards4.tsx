import React from 'react';
import DashboardCard5 from './DashboardCard5';
import useSWR from 'swr';
import { fetchTotalProducts } from '@/utils/api'; // Import API function
import '../src/styles/dashboardCard6.css';

interface Cards4Props {
  predictedValue: number | null;
  sellingPirce: number | null;
  last_month_sales: number | null;
  selectedMonth: string;
}

const Cards4: React.FC<Cards4Props> = ({
  predictedValue,
  sellingPirce,
  last_month_sales,
  selectedMonth,
}) => {
  // Retrieve userId from localStorage (only on client-side)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const nextMonth = selectedMonth;
  // Use SWR for data fetching
  const { error } = useSWR(
    userId ? ['get-total-products', userId] : null,
    () => fetchTotalProducts(userId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  // Calculate sales values
  const predictedSales = Math.round((predictedValue || 0) * (sellingPirce || 0));
  const lastMonthSales = Math.round((last_month_sales || 0) * (sellingPirce || 0));

  // Calculate percentage increase
  const calculatePercentageIncrease = () => {
    if (!lastMonthSales || lastMonthSales === 0) return 'N/A'; // Handle division by zero

    const increase = ((predictedSales - lastMonthSales) / lastMonthSales) * 100;
    return `${increase >= 0 ? '+' : ''}${Math.round(increase)}%`;
  };
  // Enhanced restocking advice with more detailed analysis
  const getRestockingAdvice = () => {
    if (predictedValue === null || last_month_sales === null) {
      return {
        text: "Insufficient data to provide restocking advice.",
        severity: 'neutral',
        action: 'Review data'
      };
    }

    const currentStockLevel = last_month_sales;
    const predictedDemand = predictedValue;
    const stockDifference = predictedDemand - currentStockLevel;
    const percentageDiff = (stockDifference / currentStockLevel) * 100;

    if (stockDifference > currentStockLevel * 0.5) { // More than 50% increase
      return {
        text: `⚠️ Significant demand increase expected! Recommended to order ${Math.ceil(stockDifference)} units (${Math.round(percentageDiff)}% more)`,
        severity: 'high',
        action: 'Order now'
      };
    } else if (stockDifference > 0) {
      return {
        text: `↑ Moderate demand increase. Consider ordering ${Math.ceil(stockDifference)} more units (${Math.round(percentageDiff)}% increase)`,
        severity: 'medium',
        action: 'Review stock'
      };
    } else if (stockDifference < - (currentStockLevel * 0.3)) { // More than 30% decrease
      return {
        text: `↓ Significant demand decrease (${Math.round(-percentageDiff)}%). Reduce orders substantially.`,
        severity: 'low',
        action: 'Adjust orders'
      };
    } else if (stockDifference < 0) {
      return {
        text: `↘ Slight demand decrease. Maintain current stock levels.`,
        severity: 'neutral',
        action: 'Monitor'
      };
    } else {
      return {
        text: `→ Demand stable. Current stock levels are adequate.`,
        severity: 'neutral',
        action: 'No action'
      };
    }
  };

  const percentageIncrease = calculatePercentageIncrease();
  const restockingData = getRestockingAdvice();

  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="cardSection5">
      <DashboardCard5
        main="Forecast of sales"
        subTitle={`${nextMonth} Month Sales`}
        value={Math.round((predictedValue || 0) * (sellingPirce || 0)).toLocaleString()}
        value2={`${predictedValue || 0} units`}
        // guidance="Based on current trends"
        description="Total Sales"
        // description2="Forecast powered by AI"
        bgColor="#9FE870"
        percentage={`${percentageIncrease}`}

      >
        <span className="arrow right" />
      </DashboardCard5>
      <DashboardCard5
        main="Predicted Demand"
        subTitle={`${nextMonth} Month Demand`}
        value={`${predictedValue ? predictedValue.toFixed(2) : 0}`}
        
        description={`Unit Demand`}
        // link="/dashboard/vendor"
        bgColor="#9FE870"
        // as={Link}

      >
        <span className="arrow right" />
      </DashboardCard5>
      <DashboardCard5
        main="Inventory Recommendation"
        value2={restockingData.action}
        description2={restockingData.text}
        // link="/dashboard/vendor"
        bgColor="#9FE870"
        // as={Link}
        guidance={restockingData.severity}
      // customIcon={getSeverityIcon(restockingData.severity)}
      >
        <span className="arrow right" />
      </DashboardCard5>
    </div>
  );
};

// Helper function for severity icons
// const getSeverityIcon = (severity) => {
//   switch(severity) {
//     case 'high':
//       return '⚠️';
//     case 'medium':
//       return '🔍';
//     case 'low':
//       return '📉';
//     default:
//       return '✅';
//   }
// };

export default Cards4;
