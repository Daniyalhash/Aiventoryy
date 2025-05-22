import React, { useState, useEffect  } from 'react';
import axios from 'axios';
import DashboardCard2 from '@/components/DashboardCard2';
import CompetitorComparisonChart from '@/components/CompetitorComparisonChart';
import SimpleStockPieChart from '@/components/SimpleStockPieChart';

import useSWR from 'swr';
import { fetchDashboardVisuals, fetchSales } from '@/utils/api';
import DashboardCard8 from './DashboardCard8';

const Cards2 = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [openOrders, setOpenOrders] = useState<number>(0);

  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success
  useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/aiventory/get-invoices/", {
        params: { user_id: userId }
      });
      console.log("Open order count:", response.data.openOrderLen);

      if (response.data && typeof response.data.openOrderLen === 'number') {
        setOpenOrders(response.data.openOrderLen);
      } else {
        setOpenOrders(0);
      }
    } catch (error) {
      setMessage("Failed to load open orders. Please try again.");
      setIsError(true);
      console.error("Error fetching open orders:", error);
      setOpenOrders(0);
    }
  };

   if (userId) {
    fetchInvoices();
  }
}, [userId]);
  // Retrieve userId from localStorage (only in client-side)

  // Default stock data in case API fails
  const defaultStockData = {
    outOfStock: 10,
    lowStock: 25,
    healthyStock: 65,
  };
interface BenchmarkItem {
  category: string;
  product: string;
  yourPrice: number;
  marketAverage: number;
}

type BenchmarkType = BenchmarkItem[];
  // Use SWR for fetching benchmark data
// Define the correct type for benchmark data, or use 'any' as a fallback

const { data: benchmarkData, error } = useSWR<BenchmarkType>(
    userId ? ['get-dashboard-visuals', userId] : null,
    () => fetchDashboardVisuals(userId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onErrorRetry: (error) => {
        if (error.status === 404 || error.status === 401) return;
      }
    }
  );
  const { data: salesData, SalesError } = useSWR(
    userId ? ['get_monthly_sales', userId] : null,
    fetchSales, // don't wrap it

    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onErrorRetry: (error) => {
        if (error.status === 404 || error.status === 401) return;
      }
    }
  );
  console.log("past data", salesData)
  useEffect(() => {
    if (SalesError) {
      setIsLoading(false);
      setIsError(true);

      let userFriendlyMessage = "We're having trouble loading your analytics data. ";

      if (SalesError.message.includes("401")) {
        userFriendlyMessage += "Your session might have expired. Please refresh the page or log in again.";
      } else if (SalesError.message.includes("404")) {
        userFriendlyMessage += "The analytics data couldn't be found. This might be temporary.";
      } else if (SalesError.message.includes("network")) {
        userFriendlyMessage += "There's a network connection problem. Please check your internet.";
      } else {
        userFriendlyMessage += "Please try refreshing the page. Contact support if this continues.";
      }

      setMessage(userFriendlyMessage);
    } else if (salesData) {
      setIsLoading(false);
      setIsError(false);
    }
  }, [salesData, SalesError]);


  useEffect(() => {
    if (error) {
      setIsLoading(false);
      setIsError(true);

      let userFriendlyMessage = "We're having trouble loading your analytics. ";

      if (error.message.includes("401")) {
        userFriendlyMessage += "Your session might have expired. Please refresh the page or log in again.";
      } else if (error.message.includes("404")) {
        userFriendlyMessage += "The analytics data couldn't be found. This might be temporary.";
      } else if (error.message.includes("network")) {
        userFriendlyMessage += "There's a network connection problem. Please check your internet.";
      } else {
        userFriendlyMessage += "Please try refreshing the page. Contact support if this continues.";
      }

      setMessage(userFriendlyMessage);
    } else if (benchmarkData) {
      setIsLoading(false);
      setIsError(false);
    }
  }, [benchmarkData, error]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="LargecardSection">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="LargecardSection">
      {/* Success/Error Message Container */}
      {message && (
        <div className={`messageContainer show ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
            {isError && (
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}



      {openOrders === 0 ? (
        <DashboardCard2
          title="Stock Analysis"
          value={0}
          link="/dashboard/insights"
          bgColor="bg-custom-third"
          graphContent={
            <SimpleStockPieChart
              data={defaultStockData}
              isDefaultData={!!error}
            />
          }
        />
      ) : (
        <DashboardCard8
          title="Vendor Orders"
          link="/dashboard/vendor"
        />
      )}


      <DashboardCard2
        title="Product Benchmarking"
        value={0}
        link="/dashboard/insights"
        bgColor="bg-custom-one"
        graphContent={
          <CompetitorComparisonChart
            data={benchmarkData || []}
            fallbackMessage={error ? "Couldn't load benchmark data" : undefined}
          />
        }
      />
    </div>
  );
};

export default Cards2;