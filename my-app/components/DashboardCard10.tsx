import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '../src/styles/dashboardCard9.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
const DashboardCard10 = ({ title, link, subTitle }) => {
   const [action, setAction] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
    const [prediction, setPredictions] = useState<any[]>([]);

  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    const fetchDataset = async () => {
      setLoading(true);
      try {
        console.log("user id for data", userId);

        // Make sure userId exists before making the call
        if (!userId) {
          throw new Error("User ID not found");
        }
        console.log("Fetching dataset for user ID:", userId);
        const response = await axios.get("http://127.0.0.1:8000/aiventory/get_expiry_forecast/", {
          params: { user_id: userId }
          
        });

        console.log("Fetched values:", response.data);

        if (response.data.status === 'success' && Array.isArray(response.data.products)) {
          setProducts(response.data.products); // Save product list
        } else {
          setError("No products found in the response.");
          setProducts([]); // Ensure it's empty
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching dataset:", err);
        setError(err.response?.data?.message || "Failed to fetch dataset.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };


const fetchPredictions = async () => {
  setLoading(true);
  try {
    const userId = localStorage.getItem("userId");

    if (!userId) throw new Error("User ID not found");

    const response = await axios.get("http://127.0.0.1:8000/aiventory/fetch_cached_predictions/", {
      params: { user_id: userId }
    });

    const data = response.data;
    const predictionList = data.predictions || [];

    console.log("Fetched prediction values:", predictionList.length);

    if (data.status === 'success' && Array.isArray(predictionList)) {
      setPredictions(predictionList.slice(0, 50)); // ✅ Show first 50 only
      setError(null);
    } else {
      setError("No predictions found in the response.");
      setPredictions([]);
    }
  } catch (err: any) {
    console.error("Error fetching predictions:", err);
    setError(err?.response?.data?.message || "Failed to fetch predictions.");
    setPredictions([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPredictions();
}, []);
      console.log("found these val", prediction)

   const [message, setMessage] = useState(""); // Can be error or success
    const [isError, setIsError] = useState(false); // To differentiate between error and success
 const expiryRiskProducts = [
    {
      id: "P101",
      name: "Milk",
      category: "Dairy",
      stock: 80,
      daysLeft: 5,
      riskLevel: "High",
      suggestedDiscount: "25%",
    },
    {
      id: "P102",
      name: "Bread",
      category: "Bakery",
      stock: 30,
      daysLeft: 3,
      riskLevel: "Medium",
      suggestedDiscount: "15%",
    },
    {
      id: "P103",
      name: "Yogurt",
      category: "Dairy",
      stock: 20,
      daysLeft: 10,
      riskLevel: "Low",
      suggestedDiscount: "–",
    },
  ];
 
  
// Function to handle deleting an invoice


  return (
    <div className="card9">
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
      <div className="cardHeader9">
        <h3 className="cardTitle9">{title}</h3>
        <h3 className='cardTitle19'>
          {subTitle}
        </h3>   
           </div>

      <div className="tableWrapper9">
        <table className="orderTable9">
          <thead>
            <tr>
              <th>Product</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Days Left</th>
            <th>Risk Level</th>
            <th>Suggested Discount</th>
            <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {prediction.map((item, index) => {
    const expiryDate = new Date(item.expirydate);
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)), 0); // prevent negative days

    return (
      <tr key={index}>
        <td>{item.productname}</td>
        <td>{item.category}</td>
        <td>{item.stockquantity}</td>
        <td>{daysLeft} days</td>
        <td className={`risk ${item.risk_level?.toLowerCase()}`}>{item.risk_level}</td>
        <td>{item.action_suggestion || "–"}</td>
        <td>
          {item.risk_level && !item.risk_level.toLowerCase().includes("low") ? (
            <button className="receivedBtn19" >Discount Now</button>
          ) : (
            <span className="deleteBtn19">–</span>
          )}
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>

  

    </div>
  );
};

export default DashboardCard10;
