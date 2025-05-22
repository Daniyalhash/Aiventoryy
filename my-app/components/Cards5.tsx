import React,  from 'react';

import '../src/styles/dashboardCard6.css';



const Cards5 = ({ predictedValue, last_month_sales }) => {

  const getRestockingAdvice = () => {
    if (predictedValue === null || last_month_sales === null) {
      return "Insufficient data to provide restocking advice.";
    }

    const currentStockLevel = last_month_sales;
    const predictedDemand = predictedValue;
    const stockDifference = predictedDemand - currentStockLevel;

    if (stockDifference > 0) {
      return `⚠️ Stock might not be enough! Consider ordering ${Math.ceil(stockDifference)} more units.`;
    } 
    else if (stockDifference < -10) {
      return "📉 Demand seems low. Reduce stock orders for next month.";
    } 
    else {
      return "✅ Stock level is sufficient. No need to restock currently.";
    }
  };

  const restockingAdvice = getRestockingAdvice();

  return (
    <div className="large-card-section">
      <div className="restocking-card">
        <h2 className="card-title">Smart Restocking Advice</h2>
        <p className="card-text">{restockingAdvice}</p>
      </div>
    </div>
  );
};

export default Cards5;
