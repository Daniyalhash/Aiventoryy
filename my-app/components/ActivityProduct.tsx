import React, { useState, useEffect } from "react";
import axios from "axios";
import "@/styles/form.css";
interface AxiosError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

interface Log {
  _id: string;
  timestamp: string;
  entity_type: string;
  action: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

const ActivityProduct = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [logs, setLogs] = useState<Log[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
useEffect(() => {
  const fetchLogs = async () => {
    if (!userId) {
      setMessage("User ID not found. Please log in.");
      setIsError(true);
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/aiventory/get_logs/", {
        params: { user_id: userId, entity_type: "product" }
      });

      const data = response.data.logs || [];
      console.log(data)
      if (data.length > 0) {
        setLogs(data);
        setMessage(`${data.length} log(s) retrieved.`);
        setIsError(false);
      } else {
        setLogs([]);
        setMessage("No logs found for this user.");
        setIsError(true);
      }
    } catch (error: unknown) {
  let errorMsg = "Failed to fetch logs.";

  if (typeof error === "object" && error !== null) {
    const err = error as AxiosError;
    if (err.response?.data?.error) {
      errorMsg = err.response.data.error;
    } else if (err.message) {
      errorMsg = err.message;
    }
  }
      setMessage(errorMsg);
      setIsError(true);
      setLogs([]);
      console.error("Fetch Logs Error:", errorMsg);
    }
  };

  fetchLogs();
}, [userId]);

  return (
    <div className="search-form-container">
     <div className={`messageContainer ${message ? 'show' : ''} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
        {logs.length === 0 && <p>No logs to show.</p>}

        {logs.map((log) => (
          <div
            key={log._id}
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

export default ActivityProduct;