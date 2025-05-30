import React, { useState, useEffect } from "react";
import "@/styles/showCSVData.css";

// Define interface for dataset items
interface DatasetItem {
  [key: string]: string | number | undefined;
}

// Vendor specific interface
interface Vendor extends DatasetItem {

  vendor_name: string;
  vendor_phone: string;
  reliability_score: number;
  delivery_time: number;
  category: string;
  linked_products?: number;
  [key: string]: string | number | undefined;
}
interface InventoryData extends DatasetItem {
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
}

interface ShowCSVDataProps {
  dataset: Vendor[] | InventoryData[];
}
const ShowCSVData: React.FC<ShowCSVDataProps> = ({ dataset }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (dataset && dataset.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [dataset]);

  const handleCloseMessage = () => {
    setMessage("");
    setIsError(false);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your data...</p>
      </div>
    );
  }

  if (!dataset || dataset.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No Data Available</h3>
        <p>We couldn&apos;t find any data to display.</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="csv-table-container">
      {/* Message Notification */}
      {message && (
        <div className={`message-notification ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <p>{message}</p>
            <button 
              className="close-button"
              onClick={handleCloseMessage}
              aria-label="Close message"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="csv-table">
          <thead>
            <tr>
              {Object.keys(dataset[0]).map((key) => (
                <th key={key}>
                  {key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.slice(0, 100).map((row, idx) => ( // Limit to 100 rows for performance
              <tr key={`row-${idx}`}>
                {Object.values(row).map((value, idy) => (
                  <td key={`cell-${idx}-${idy}`}>
                    {typeof value === 'string' || typeof value === 'number' ? value : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {dataset.length > 100 && (
          <div className="table-footer">
            Showing first 100 rows of {dataset.length} total rows
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ShowCSVData;