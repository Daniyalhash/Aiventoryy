// "use client";
// import InventoryOver from "@/components/InventoryOver";
// import InventoryOver2 from "@/components/InventoryOver2";

// import "@/styles/inventory.css";
// import ButtonFrame from "@/components/ButtonFrame";
// import ButtonAction from "@/components/ButtonAction";
// import ShowCSVData from "@/components/ShowCSVData";
// import axios from "axios";

// import { useState, useEffect } from "react";
// import VisualGroupInventory from "@/components/VisualGroupInventory";

// function Inventory() {
//   const [action, setAction] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState<any[]>([]); // To store the product data


//   const handleActionClick = (actionName: string) => setAction(actionName);
//   const userId = localStorage.getItem("userId");

// useEffect(() => {
//   const fetchDataset = async () => {
//     setLoading(true); // Set loading to true before fetching
//     try {
//       console.log("user id for data", userId);
//       const response = await axios.get("http://127.0.0.1:8000/aiventory/get-current-dataset/", {
//         params: { user_id: userId },
//       });

//       console.log("Fetched Dataset:", response.data);

//       // Ensure that the response structure is correct
//       if (response.data && response.data.products) {
//         // Flatten the products array since it is wrapped inside another array
//         setProducts(response.data.products.flat());
//       } else {
//         setError("No products found.");
//       }
//       setError(null); // Reset any previous errors
//     } catch (err) {
//       console.error("Error fetching dataset:", err);
//       setError(err.response?.data?.error || "Failed to fetch dataset.");
//     } finally {
//       setLoading(false); // Set loading to false after fetching
//     }
//   };

//   if (userId) fetchDataset();
// }, [userId]);




//   return (
//     <div className="InventoryPage">
//       <InventoryOver />
//       <ButtonFrame onActionClick={handleActionClick} />

//       <div className="actionContainer">
//         <ButtonAction action={action} />
//       </div>

//       {/* Dataset Section with a Specific Class */}
//     {/* Dataset Section */}
//     {loading ? (
//         <div className="loadingAnimation">
//           <div className="gemini-shine"></div>
//         </div>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : (
//         <div className="dataset-feature">
//           <ShowCSVData dataset={products} />
//         </div>
//       )}



//       <InventoryOver2 />

//       {loading ? (
//         <div className="loadingAnimation">
//           <div className="gemini-shine"></div>
//         </div>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : (
//         <div className="visual-feature">

//         <VisualGroupInventory />

//         </div>
//       )}


//     </div>
//   );
// }

// export default Inventory;
"use client";
import InventoryOver from "@/components/InventoryOver";
import "@/styles/inventory.css";
import ButtonFrame5 from "@/components/ButtonFrame5";
import ButtonAction from "@/components/ButtonAction";
import ShowCSVData from "@/components/ShowCSVData";
import VisualGroupInventory from "@/components/VisualGroupInventory";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Skeleton from "@mui/material/Skeleton";
import StatsCards from "@/components/StatsCards";
import DashboardCard10 from "@/components/DashboardCard10";


function Inventory() {
  const [action, setAction] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null); // Store stats from response2
  const [error, setError] = useState<string | null>(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        console.log("user id for data", userId);
        const response = await axios.get("http://127.0.0.1:8000/aiventory/get-current-dataset/", {
          params: { user_id: userId },
        });

        console.log("Fetched Dataset:", response.data);
        console.log("user id for data", userId);
        const response2 = await axios.get("http://127.0.0.1:8000/aiventory/get-inventory-summary/", {
          params: { user_id: userId },
        });

        console.log("Fetched values:", response2.data);
        // Ensure that the response structure is correct
        if (response.data && response.data.products) {
          // Flatten the products array since it is wrapped inside another array
          setProducts(response.data.products.flat());
        } else {
          setError("No products found.");
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
            {/* <button className="retry-btn" onClick={fetchDataset}>
              Retry
            </button> */}
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
{/* 
      <InventoryOver2 />

      <div className="visual-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-animation"></div>
            <p>Loading inventory visuals...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={fetchDataset}>
              Retry
            </button>
          </div>
        ) : (
          <div className="visual-feature">
            <VisualGroupInventory />
          </div>
        )}
      </div> */}