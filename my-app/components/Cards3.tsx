

import React, { useState } from 'react';
import DashboardCard4 from '@/components/DashboardCard4';
import PredictedDemandChart from './PredictedDemandChart';
import SalesBarChart from './SalesBarChart';
import HistoricalSalesChart from './HistoricalSalesChart';
import DashboardCard7 from '@/components/DashboardCard7';

type Cards3Props = {
  predictedValue: number | null;
  isLoading: boolean;
  predictionError: string | null;
  selectedProduct: string  | null;
  selectedCategory: string  | null;
  sellingPirce: number  | null;
  last_month_sales: number  | null;
  historicalData: any; // Replace 'any' with a more specific type if available
  selectedMonth: string;
  selectedGranularity: string  | null;
};

const Cards3 = ({
  predictedValue,
  isLoading,
  predictionError,
  selectedProduct,
  selectedCategory,
  sellingPirce,
  last_month_sales,
  historicalData,
  selectedMonth,
  selectedGranularity
}: Cards3Props) => {
  const [demandRange, setDemandRange] = useState('Day 15');
  const [salesRange, setSalesRange] = useState('Day 15');
  const [monthRange, setMonthRange] = useState('Month 3');

  console.log("se;;ingPrice", sellingPirce)
  console.log("se;;last_month_sales", last_month_sales)

  return (
    <div className="LargecardSection">
      {selectedGranularity === 'month' ? (

        <DashboardCard7
          title="Historical Sales Analysis"
          description="Past Sales X Predicted"
          bgColor="bg-custom-second"
          granularity="month" // This tells DashboardCard4 to show month ranges
          onRangeChange={setMonthRange} // Your existing handler
          graphContent={
            <>
              {isLoading ? (
                <div className="loading-indicator">Loading...</div>
              ) : predictionError ? (
                <div className="error-message">{predictionError}</div>
              ) : (
                <HistoricalSalesChart
                  historicalData={historicalData}
                  predictedValue={predictedValue}
                  selectedRange={monthRange}
                  selectedMonth = {selectedMonth} // Pass the selected range
                />
              )}
            </>
          }
        />
      ) : (
        // Show Product Prediction & Historical Sales
        <>
          <DashboardCard4
            title="Product Prediction"
            description="Daily Demand prediction for a month"
            bgColor="bg-custom-one"
            graphContent={
              <>
                {isLoading ? (
                  <div className="loading-indicator">Predicting...</div>
                ) : predictionError ? (
                  <div className="error-message">{predictionError}</div>
                ) : (
                  <PredictedDemandChart
                    selectedRange={demandRange}
                    predictedValue={predictedValue}
                    
                  />
                )}
              </>
            }
            onRangeChange={setDemandRange}
          />

          <DashboardCard4
            title="Monthly Sales Analysis"
            description="Daily Sales prediction for a month"
            bgColor="bg-custom-third"
            graphContent={
              <>
                {isLoading ? (
                  <div className="loading-indicator">Predicting...</div>
                ) : predictionError ? (
                  <div className="error-message">{predictionError}</div>
                ) : (
                  <SalesBarChart
                    predictedValue={predictedValue}
                    last_month_sales={last_month_sales}
                    sellingPirce={sellingPirce}
                    productName={selectedProduct}
                    category={selectedCategory}
                    selectedRange={salesRange}
                  />
                )}
              </>
            }
            onRangeChange={setSalesRange}

          />
        </>
      )}
    </div>
  );
};

export default Cards3;