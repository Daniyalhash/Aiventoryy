
"use client";
import InventoryOver from "@/components/InventoryOver";
import "@/styles/inventory.css";
import ButtonFrame5 from "@/components/ButtonFrame5";
import ShowCSVData from "@/components/ShowCSVData";
import axios from "axios";
import { useState, useEffect } from "react";
import StatsCards from "@/components/StatsCards";
import DashboardCard10 from "@/components/DashboardCard10";
interface InventoryData {
  product_id: string;
  productname: string;
  category: string;
  subcategory: string;
  stockquantity: number;
  costprice: number;
  sellingprice: number;
  barcode: string;
  product_size: string;
  expirydate: string;
  monthly_sales: number;
  reorderthreshold: number;
  sale_date: string;
  season: string;
  timespan: string;
  vendor_id: string;
  [key: string]: string | number; // Keep index signature for compatibility
}


interface InventoryStats {
  total_products: number;
  total_unique_products: number;
  total_expired: number;
}

function Inventory() {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<InventoryData[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
const userId: string | null = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
  const fetchDataset = async () => {
    setLoading(true);
    try {
      const [productsResponse, statsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/aiventory/get-current-dataset/", {
          params: { user_id: userId },
        }),
        axios.get("http://127.0.0.1:8000/aiventory/get-inventory-summary/", {
          params: { user_id: userId },
        }),
      ]);

      if (productsResponse.data?.products) {
        const productsRaw = productsResponse.data.products;
        if (Array.isArray(productsRaw)) {
          const flattened = productsRaw.flat ? productsRaw.flat() : productsRaw;
          const transformedProducts = flattened.map((p: any) => ({
            product_id: p.product_id || '',
            productname: p.productname || '',
            category: p.category || '',
            subcategory: p.subcategory || '',
            stockquantity: p.stockquantity || 0,
            costprice: p.costprice || 0,
            sellingprice: p.sellingprice || 0,
            barcode: p.barcode?.toString() || '',
            product_size: p.product_size || '',
            expirydate: p.expirydate || '',
            monthly_sales: p.monthly_sales || 0,
            reorderthreshold: p.reorderthreshold || 0,
            sale_date: p.sale_date || '',
            season: p.season || '',
            timespan: p.timespan || '',
            vendor_id: p.vendor_id || ''
          }));
          setProducts(transformedProducts);
        } else {
          setError("No products found.");
        }
      } else {
        setError("No products found.");
      }

      if (statsResponse.data?.data) {
        setStats(statsResponse.data.data);
      } else {
        setError("No stats found.");
      }

      setError(null); // reset error if everything went fine

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

            />
          </>

        )}
      </div>

    </div>
  );
}

export default Inventory;
