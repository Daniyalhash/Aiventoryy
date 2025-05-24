import React, { useState, useEffect,useCallback } from "react";
import axios from "axios";
import "@/styles/form.css";
// interface LogEntry {
//   _id: string;
//   timestamp: string;
//   entity_type: string;
//   action: string;
//   entity_id?: string;
//   metadata?: Record<string, any>;
// }
interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  details: {
    vendorName?: string;
    productName?: string;
    quantity?: number;
    status?: string;
  };
}
const ActivityVendor: React.FC = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [logs, setLogs] = useState<ActivityLog[]>([]);


  const fetchLogs = useCallback(async () => {
  if (!userId) {
    
    return;
  }
  try {
    const response = await axios.get("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_logs/", {
      params: { user_id: userId, entity_type: "vendor" }
    });

       setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [userId]);


  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // Added fetchLogs to dependencies


  return (
    <div className="search-form-container">
  
<div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      {logs.length === 0 && <p>No logs to show.</p>}

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            borderLeft: "3px solid #4caf50",
            paddingLeft: 15,
            marginBottom: 20,
            position: "relative",
          }}
        >
          {/* Circle marker */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#4caf50",
              position: "absolute",
              left: -8,
              top: 5,
            }}
          ></div>

          <div style={{ color: "#666", fontSize: 14, marginBottom: 5 }}>
            {log.timestamp}
          </div>

          <div style={{ fontWeight: "bold", fontSize: 16, color: "#333" }}>
            {log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1)}{" "}
            &nbsp;
            <span style={{ color: "#888", fontWeight: "normal" }}>
              → {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
            </span>
            &nbsp;
  <span style={{ color: "#888", fontWeight: "normal" }}>
    → {log.entity_id ? log.entity_id.charAt(0).toUpperCase() + log.entity_id.slice(1) : "N/A"}
  </span>
            
          </div>

          {/* Optional metadata preview */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <pre
              style={{
                backgroundColor: "#f5f5f5",
                padding: 8,
                borderRadius: 4,
                marginTop: 6,
                fontSize: 13,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
 
      
    </div>
  );
};

export default ActivityVendor;