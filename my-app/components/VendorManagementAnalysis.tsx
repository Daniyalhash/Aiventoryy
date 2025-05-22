import axios from "axios";
import React, { useEffect, useState } from "react";

import {
 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import "@/styles/visualGroupInventory.css"; // Import CSS styles

interface VendorReliability {
  vendor: string;
  reliability_score: number;
}

interface VendorDelivery {
  vendor: string;
  delivery_time: number;
}

interface VisualData {
  top_reliability_vendors: VendorReliability[];
  top_delivery_vendors: VendorDelivery[];
}

// interface ChartData {
//   vendor: string;
//   reliability?: number;
//   time?: number;
// }
const VendorManagementAnalysis = () => {
const [visualData, setVisualData] = useState<VisualData | null>(null);
const [reliabilityScores, setReliabilityScores] = useState<VendorReliability[]>([]);
const [deliveryTime, setDeliveryTime] = useState<VendorDelivery[]>([]);
  const userId = localStorage.getItem("userId");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const response = await axios.get<{ data: VisualData }>(
          `http://127.0.0.1:8000/aiventory/get-vendor-visuals/?user_id=${userId}`,
          { signal }
        );

        setVisualData(response.data);

        const reliability = (response.data.top_reliability_vendors || []).map((vendor) => ({
          vendor: vendor.vendor,
          reliability: vendor.reliability_score,
        }));
        setReliabilityScores(reliability);

        const delivery = (response.data.top_delivery_vendors || []).map((vendor) => ({
          vendor: vendor.vendor,
          time: vendor.delivery_time,
        }));
        setDeliveryTime(delivery);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Failed to fetch data");
        } else {
          setError("An unexpected error occurred");
        }
        console.error("Error fetching visual data:", error);
      }
    };

    if (userId) {
      fetchData();
    }

    return () => {
      controller.abort();
    };
  }, [userId]);


  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!visualData) {
    return <p>Loading visuals...</p>; // Simple loading message
  }


  return (
    <div className="vendor-management-container">
      {/* Best Vendors */}
   

      {/* Vendor Reliability Scores */}
      <div className="chart-container">
        <h3>Vendor Reliability Scores</h3>
        <BarChart width={1200} height={300} data={reliabilityScores}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="vendor" 
           angle={-2}  // Rotate labels for readability
           textAnchor="end"
           tick={{ fontSize: 12 }}  // Adjust tick label font size
           />
          <YAxis />
          <Tooltip />
          <Bar dataKey="reliability" fill="#82ca9d" />
        </BarChart>
        <p>This bar chart ranks vendors by their reliability scores, helping identify the most dependable partners.</p>
      </div>

      {/* Delivery Times */}
      <div className="chart-container">
        <h3>Best Vendors by Delivery Time</h3>
        <LineChart width={1200} height={300} data={deliveryTime} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="vendor"
           angle={-2}  // Rotate labels for readability
           textAnchor="end" 
           tick={{ fontSize: 12 }}  // Adjust tick label font size

           
           
           />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="time" stroke="#8884d8" />
        </LineChart>
        <p>This line chart evaluates vendors based on their delivery times, showcasing efficiency in meeting supply demands.</p>
      </div>
    </div>
  );
};

export default VendorManagementAnalysis;

