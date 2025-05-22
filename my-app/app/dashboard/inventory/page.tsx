
"use client";
import InventoryOver from "@/components/InventoryOver";
import "@/styles/inventory.css";
import ButtonFrame5 from "@/components/ButtonFrame5";
import ShowCSVData from "@/components/ShowCSVData";
import axios from "axios";
import { useState, useEffect } from "react";
import StatsCards from "@/components/StatsCards";
import DashboardCard10 from "@/components/DashboardCard10";


function Inventory() {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null); // Store stats from response2
  const [error, setError] = useState<string | null>(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const [productsResponse, statsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/aiventory/get-current-dataset/", {
            params: { user_id: userId },
          }),
          axios.get("http://127.0.0.1:8000/aiventory/get-inventory-summary/", {
            params: { user_id: userId },
          })
        ]);

       if (productsResponse.data?.products) {
          setProducts(productsResponse.data.products.flat());
        } else {
          setError("No products found.");
        }

        if (statsResponse.data?.data) {
          setStats(statsResponse.data.data);
        } else {
          setError("No stats found.");
        }
        setError(null);
      } catch (err: unknown) {
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
    <div className="InventoryPage">
      <InventoryOver />

      <ButtonFrame5 />


      {/* Dataset Section */}
      <div className="dataset-container2">

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
              <div className="dataset-feature">
            {stats && (
              <StatsCards
                totalDatasetSize={stats?.total_products || 0}
                totalUniqueProducts={stats?.total_unique_products || 0}
                totalExpiredProducts={stats?.total_expired || 0}
              />
            )}
            <ShowCSVData dataset={products} />

          </div>
             <DashboardCard10
              title="AI Waste Reducer"
              link="/dashboard/vendor"
              subTitle="Monitor expiry risks & suggested discounts"
            />
          </>
      
        )}
      </div>

    </div>
  );
}

export default Inventory;
