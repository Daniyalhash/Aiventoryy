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
  vendor_name: string;
  vendor_phone: string;
  reliability_score: number;
  delivery_time: number;
  category: string;
  vendor_id: string;

  last_updated: string | undefined;
  [key: string]: string | number | undefined;
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

  const [userId, setUserId] = useState<string | null>(null);


useEffect(() => {
    // Access localStorage only in the browser
    const id = localStorage.getItem("userId");
    setUserId(id);
  }, []);

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const [vendorResponse, statsResponse] = await Promise.all([
          axios.get("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-vendor/", {
            params: { user_id: userId },
          }),
          axios.get("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_vendor_summary/", {
            params: { user_id: userId },
          })
        ]);
        if (vendorResponse.data?.vendors) {
           const transformedVendors = vendorResponse.data.vendors.flat().map((v: any) => ({
          vendor_name: v.vendor || '',
          vendor_phone: v.vendorPhone?.toString() || '',
          reliability_score: v.ReliabilityScore || 0,
          delivery_time: v.DeliveryTime || 0,
          category: v.category || '',
          vendor_id: v.vendor_id || '',
last_updated: v.last_updated || undefined
        }));
        setVendors(transformedVendors);
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
                // link="/dashboard/vendor"
                subTitle="View all previous vendor orders in one place"
              />
          
            </div>
   <div className="dashboard-cards-container">
          
                <DashboardCard11
                title="Vendor Performance"
                
              />
          
            </div>

          </>
        )}
      </div>
    </div>
  );

}