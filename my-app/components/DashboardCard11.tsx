import React, { useState } from 'react';
import '../src/styles/dashboardCard11.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine,faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import {
  Chart,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Needed for time scale

// 📈 Register all required chart components
Chart.register(
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const DashboardCard11 = ({ title}) => {
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [message, setMessage] = useState(""); // Success/error message
  const [isError, setIsError] = useState(false);
  const [vendorStats, setVendorStats] = useState(null); // Store vendor stats here
  const [isLoading, setIsLoading] = useState(false);
  const [vendorId, setVendorId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vendorId.trim()) {
      handlePerformance(userId, vendorId.trim());
    }else {
      setMessage("❌ Please enter a Vendor ID");
      setIsError(true);
    }
  }
  // 🔍 Fetch vendor performance on click
  const handlePerformance = async (user_id, vendor_id) => {
    console.log('Starting performance with:', { user_id, vendor_id });
    setIsLoading(true);
    setMessage("");
    setIsError(false);
    setVendorStats(null); // Clear previous data

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/aiventory/get_vendor_performance/",
        { params: { user_id, vendor_id } }
      );

      console.log("responsse:", response.data.data);
      setVendorStats(response.data.data || {});
      setMessage("✅ Vendor performance loaded successfully.");
    } catch (error) {
      console.error("performance error:", error);
      setMessage("❌ Failed to load vendor performance");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data if we have reliability score history
  const prepareChartData = () => {
    if (!vendorStats?.reliability_score_history?.length) return null;

    const history = vendorStats.reliability_score_history;

    return {
      labels: history.map(item => new Date(item.date)),
      datasets: [
        {
          label: 'Reliability Score Trend',
          data: history.map(item => item.score),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgb(75, 192, 192)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHitRadius: 10,
          pointBorderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll use custom legend
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#17412D',
        bodyColor: '#495057',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            return `Score: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6c757d',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
        },
        ticks: {
          color: '#6c757d',
        },
        min: 0,
        max: 100,
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
        backgroundColor: '#ffffff',
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="card11">
       {message && (
        <div className={`messageContainer ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
            {isError && (
              <button
                className="retry-button"
                onClick={() => vendorId && handlePerformance(userId, vendorId)}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <div className="cardHeader9">
        <div className="cardHead">
          <h3 className="cardTitle9">{title}</h3>
        </div>
      <form onSubmit={handleSubmit} className="vendor-id-form">
          <input
            type="text"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="Enter Vendor ID"
            className="vendor-id-input"
          />
          <button type="submit" className="vendor-id-submit">
             {isLoading ? (
              <div className="search-spinner"></div>
            ) : (
              <FontAwesomeIcon icon={faSearch} />
            )}
          </button>
        </form>
      </div>
      <div className="card-content-container">

        {isLoading ? (
          <div className="loadingStateBox">
            <div className="loading-spinner"></div>
            <p>Loading vendor data...</p>
          </div>
        ) : vendorStats ? (
          <>
            <div className="vendor-stats-card">
              <div className="stat-row">
                <div className="stat-label"><span>📊</span> Vendor ID</div>
                <div className="stat-value vendor-id">{vendorStats.vendor_id}</div>
              </div>

              <div className="stat-row">
                <div className="stat-label"><span>📦</span> Total Orders</div>
                <div className="stat-value highlight">{vendorStats.total_orders}</div>
              </div>

              <div className="stat-row">
                <div className="stat-label"><span>⏱️</span> Avg Delivery</div>
                <div className="stat-value">{vendorStats.avg_delivery_days} <small>days</small></div>
              </div>

              <div className="stat-row">
                <div className="stat-label"><span>💯</span> On-Time Rate</div>
                <div className="stat-value highlight">{vendorStats.on_time_percentage}%</div>
              </div>

              <div className="stat-row">
                <div className="stat-label"><span>📈</span> Score Trend</div>
                <div className="stat-value last-scores">
                  {Array.isArray(vendorStats.last_5_scores)
                    ? vendorStats.last_5_scores.join(" → ")
                    : "No history yet"}
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-label"><span>📅</span> Last Status</div>
                <div className="stat-value status">{vendorStats.last_delivery_status}</div>
              </div>

              <div className="stat-row">
                <div className="stat-label"><span>🔄</span> Last Updated</div>
                <div className="stat-value date">
                  {vendorStats.last_updated
                    ? new Date(vendorStats.last_updated).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>

            {/* Chart Section */}
            {vendorStats.reliability_score_history?.length > 0 && (
              <div className="chart-container">
                <div className="chart-wrapper">
                  <Line
                    data={prepareChartData()}
                    options={chartOptions}
                    height={300}
                  />
                </div>
                <div className="chart-note">
                  <FontAwesomeIcon icon={faChartLine} />
                  <span>Reliability score trend over time (higher is better)</span>
                </div>
                <div className="chart-legend">
                  <div className="chart-legend-item">
                    <div className="chart-legend-color"></div>
                    <span>Reliability Score</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="emptyStateBox">
            <p>🔍 No vendor data loaded</p>
            <small>
              {vendorId 
                ? `No data found for Vendor ID: ${vendorId}`
                : "Enter a Vendor ID to search"}
            </small>
          </div>
        )}
      </div>


    </div>
  );
};

export default DashboardCard11;


{/* Show vendor stats only if we have data */ }
