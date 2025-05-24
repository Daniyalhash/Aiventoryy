import React, { useState } from "react";
import axios from "axios";
import "@/styles/form.css";

type Vendor = {
 vendor_id: string;
  vendor: string;
  category: string;
  vendorPhone: number;
  DeliveryTime: number;
  ReliabilityScore: number;
  last_updated: string;
 


}




const SearchForm = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [vendorName, setVendorName] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<Vendor[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setMessage("User ID is required");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/search-vendor/", {
        userId,
        vendorName,
        vendorId,
        category,
      });

      const data = response.data;

      if (data.matchedVendors && data.matchedVendors.length > 0) {
        setResults(data.matchedVendors);
        setMessage(`${data.totalMatches} vendor(s) found`);
        setIsError(false);
      } else {
        setResults([]);
        setMessage("No matching vendors found");
        setIsError(true);
      }
    } catch (error) {
      
       let errorMsg = "Failed to search Vendor";

  if (axios.isAxiosError(error)) {
    errorMsg = error.response?.data?.error || error.message;
  } else if (error instanceof Error) {
    errorMsg = error.message;
  }


      setMessage(errorMsg);
      setIsError(true);
      console.error("Search Vendor Error:", errorMsg);
      setResults([]);
    }
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        {/* Message Container - Same as Login Page */}
        <div className={`messageContainer ${message ? 'show' : ''} ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
          </div>
        </div>

        <div className="form-grid">

          <div className="form-section">

            <div className="form-group">
              <label>Vendor ID:</label>
              <input
                type="text"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="Search by ID (optional)"
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Search by category (optional)"
              />
            </div>
            <div className="form-group">
              <label>Vendor Name:</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Search by name (optional)"
              />
            </div>
          </div>

        </div>
        <div className="form-actions">

          <button type="submit" className="search-button">
            Search Vendors
          </button>
        </div>

      </form>



      {/* Results Table */}
      {results.length > 0 && (
        <div className="search-results">
          <h3>Matching Vendors</h3>
          <table className="vendors-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Delivery Time</th>
                <th>Reliability Score</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {results.map((vendor, index) => (
                <tr key={index}>
                  <td>{vendor.vendor_id}</td>
                  <td>{vendor.vendor}</td>
                  <td>{vendor.category}</td>
                  <td>{vendor.vendorPhone}</td>
                  <td>{vendor.DeliveryTime}</td>
                  <td>{vendor.ReliabilityScore}</td>
                  <td>{vendor.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchForm;