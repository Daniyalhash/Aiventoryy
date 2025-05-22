
import React, { useState, useEffect } from 'react';
import DashboardCard3 from '@/components/DashboardCard3';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchTotalProducts,fetchbestDemand } from '@/utils/api';

const Cards = () => {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Retrieve userId from localStorage (only on client-side)
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

  // Use SWR for data fetching
  const { data, error } = useSWR(userId ? ['get-total-products', userId] : null, 
    () => fetchTotalProducts(userId!), 
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onErrorRetry: (error) => {
        // Don't retry on 404 or 401 errors
        if (error.status === 404 || error.status === 401) return;
      }
    }
  );


  console.log("best",userId)
  const { data: bestData, error: bestError } = useSWR(
    userId ? ['bestSales', userId] : null,
    fetchbestDemand
  );

  useEffect(() => {
    console.log("📦 bestData received from backend:", bestData); // ✅ Add this

    if (bestError) {
      setIsLoading(false);
      setIsError(true);
      
      let userFriendlyMessage = "We're having trouble loading your bestdata. ";
      
      if (bestError.message.includes("401")) {
        userFriendlyMessage += "It seems your session has expired. Please try refreshing the page or logging in again.";
      } else if (bestError.message.includes("404")) {
        userFriendlyMessage += "The requested information couldn't be found. This might be temporary - please try again later.";
      } else if (bestError.message.includes("network")) {
        userFriendlyMessage += "There seems to be a network issue. Please check your internet connection and try again.";
      } else {
        userFriendlyMessage += "Please try refreshing the page. If the problem persists, contact support.";
      }
      
      setMessage(userFriendlyMessage);
    } else if (bestData) {
      setIsLoading(false);
      setIsError(false);
    }
  }, [bestData, bestError]);

console.log("daata for best product",bestData)


  useEffect(() => {
    if (error) {
      setIsLoading(false);
      setIsError(true);
      
      let userFriendlyMessage = "We're having trouble loading your data. ";
      
      if (error.message.includes("401")) {
        userFriendlyMessage += "It seems your session has expired. Please try refreshing the page or logging in again.";
      } else if (error.message.includes("404")) {
        userFriendlyMessage += "The requested information couldn't be found. This might be temporary - please try again later.";
      } else if (error.message.includes("network")) {
        userFriendlyMessage += "There seems to be a network issue. Please check your internet connection and try again.";
      } else {
        userFriendlyMessage += "Please try refreshing the page. If the problem persists, contact support.";
      }
      
      setMessage(userFriendlyMessage);
    } else if (data) {
      setIsLoading(false);
      setIsError(false);
    }
  }, [data, error]);

  // Handle loading state with a better UI
  if (isLoading) {
    return (
      <div className="cardSection">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard information...</p>
        </div>
      </div>
    );
  }

  // If no data and no error (unlikely but possible)
  if (!data && !error) {
    return (
      <div className="cardSection">
        <div className="messageContainer error show">
          <div className="message-content">
            We couldnt retrieve your data. Please try refreshing the page.
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cardSection">
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

      {/* Dashboard Cards - Fallback to "N/A" if data is missing */}
      <DashboardCard3
        title="Automate Vendors"
        value={data?.total_vendors || "N/A"}
        
        description="Vendors"
        link="/dashboard/vendor"
        bgColor="#9FE870"
        as={Link}
        href="/dashboard/vendors"
      >
        <span className="arrow right" />
      </DashboardCard3>

      <DashboardCard3
        title="Total Products"
        value={data?.total_unique_products || "N/A"}
        description="Size of Inventory"
        link="/dashboard/inventory"
        bgColor="green-card"
        as={Link}
        arrow="right"
      >
        <span className="arrow right" />
      </DashboardCard3>

      <DashboardCard3
        title="Demand Forecasting"
        value={bestData?.prediction?.toFixed(2) || "N/A"}
        description={`${bestData?.best_product?.productname || "N/A"} (${bestData?.best_product?.category})`}
        link="/dashboard/future"

        bgColor="green-card"
        arrow="right"
        as={Link}
      >
        <span className="arrow right" />
      </DashboardCard3>
      
      <DashboardCard3
        title="Expiry Products"
        value={data?.expired_unique_products || "N/A"}
        description="Month left"
        link="/dashboard/inventory"
        bgColor="green-card"
        arrow="right"
        as={Link}
      >
        <span className="arrow right" />
      </DashboardCard3>
    </div>
  );
};

export default Cards;