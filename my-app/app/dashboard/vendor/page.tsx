"use client";
import VendorOver from "@/components/VendorOver"

import "@/styles/vendor.css";
import ShowDataset2 from "@/components/ShowCSVData";
import axios from "axios";
import { useState, useEffect } from "react";

import DashboardCard9 from "@/components/DashboardCard9";
import ButtonFrame from "@/components/ButtonFrame";
import StatsCards2 from "@/components/StatsCards2";
import DashboardCard11 from "@/components/DashboardCard11";
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

export interface VendorStats {
  totalVendor: number;
  totalVendorLinks: number;
  totalVendorNotLinks: number;
}
export default function Vendor() {
 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
const [vendors, setVendors] = useState<Vendor[]>([]);
const [stats, setStats] = useState<VendorStats | null>(null);



  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const [vendorResponse, statsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/aiventory/get-vendor/", {
            params: { user_id: userId },
          }),
          axios.get("http://127.0.0.1:8000/aiventory/get_vendor_summary/", {
            params: { user_id: userId },
          })
        ]);
        if (vendorResponse.data?.vendors) {
          setVendors(vendorResponse.data.vendors.flat());
        } else {
          setError("No vendor found.");
        }

        if (statsResponse.data?.data) {
          setStats(statsResponse.data.data);
        } else {
          setError("No stats found.");
        }
        
        setError(null);
      } catch (err) {
        const error = err as Error;
        console.error("Error fetching dataset:", error);
        setError(error.message || "Failed to fetch dataset.");
      } finally {
        setLoading(false);
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