"use client";
// app/dashboard/page.tsx
import VendorOver from "@/components/VendorOver"
// import ShowCSVData from "@/components/ShowCSVData";

import ButtonFrame2 from "@/components/ButtonFrame2";
import "@/styles/vendor.css";
import ShowDataset2 from "@/components/ShowCSVData";
import axios from "axios";
import { useState, useEffect } from "react";
import VisualGroupInventory from "@/components/VisualGroupInventory";
import VendorManagementAnalysis from "@/components/VendorManagementAnalysis";
import DashboardCard9 from "@/components/DashboardCard9";
import ButtonFrame from "@/components/ButtonFrame";
import StatsCards2 from "@/components/StatsCards2";
import DashboardCard11 from "@/components/DashboardCard11";

export default function Vendor() {
  const [action, setAction] = useState<string | null>(null);
  const [dataset, setDataset] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]); // To store the product data
  const [columns, setColumns] = useState([]); // Store column names
  const [openActionRow, setOpenActionRow] = useState(null);
  const [stats, setStats] = useState<any>(null); // Store stats from response2

  const toggleActions = (id) => {
    setOpenActionRow(openActionRow === id ? null : id);
  };

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        console.log("user id for data", userId);
        const response = await axios.get("http://127.0.0.1:8000/aiventory/get-vendor/", {
          params: { user_id: userId },
        });
        console.log("user id for data", userId);
        const response2 = await axios.get("http://127.0.0.1:8000/aiventory/get_vendor_summary/", {
          params: { user_id: userId },
        });
        // console.log("Fetched vendor Dataset:", response.data);
        console.log("Fetched values:", response2.data);

        // Ensure that the response structure is correct
        if (response.data && response.data.vendors) {
          // Use response.data.vendors instead of response.data.products
          setVendors(response.data.vendors.flat()); // Flatten the array if it's nested
          // Extract columns dynamically from the first vendor

        } else {
          setError("No vendor found.");
        }
        if (response2.data && response2.data.data) {
          setStats(response2.data.data);
        } else {
          setError("No stats found.");
        }
        setError(null); // Reset any previous errors
      } catch (err) {
        console.error("Error fetching dataset:", err);
        setError(err.response?.data?.error || "Failed to fetch dataset.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (userId) fetchDataset();
  }, [userId]);

  return (
    <div className="VendorPage">
      {/* Vendor Header Section */}
      <VendorOver />
      <ButtonFrame />

      {/* Dataset Section */}
      <div className="dataset-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-animation"></div>
            <p>Loading dataset...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
          </div>
        ) : (
          <>
            <div className="dataset-feature2">

              <StatsCards2
                totalVendorSize={stats?.totalVendor || 0}
                totalVendorLinks={stats?.totalVendorLinks || 0}
                totalVendorNotLinks={stats?.totalVendorNotLinks || 0}
              />

              <ShowDataset2 dataset={vendors} />
              
            </div>

            <div className="dashboard-cards-container">
              <DashboardCard9
                title="Vendor Orders"
                link="/dashboard/vendor"
                subTitle="View all previous vendor orders in one place"
              />
          
            </div>
   <div className="dashboard-cards-container">
          
                <DashboardCard11
                title="Vendor Performance"
                link="/dashboard/vendor"
                subTitle="View all vendor Performance in one place"
              />
          
            </div>

          </>
        )}
      </div>
    </div>
  );

}