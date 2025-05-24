import React, { useState } from "react";
import axios from "axios";
import "@/styles/form.css";

const UpdateForm = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [reliabilityScore, setReliabilityScore] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [vendorLoaded, setVendorLoaded] = useState(false); // New state to track if vendor is loaded
  const handleFetchVendor = async () => {
    if (!userId || !vendorId) {
      setMessage("User ID and Vendor ID are required to fetch vendor data.");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-vendor-id/", {
        userId,
        vendor_id: vendorId,
      });

      const vendor = response.data.vendor;
      if (vendor) {
        setVendorName(vendor.vendor || "");
        setCategory(vendor.category || "");
        setPhone(vendor.vendorPhone || "");
        setDeliveryTime(vendor.DeliveryTime?.toString() || "");
        setReliabilityScore(vendor.ReliabilityScore?.toString() || "");
        setMessage("Vendor loaded successfully");
        setVendorLoaded(true); // Set to true when vendor is successfully loaded

        setIsError(false);
      } else {
        setMessage("Vendor not found.");
        setIsError(true);
        setVendorLoaded(false); // Ensure it's false if no vendor found

      }

    } catch (error) {
      setMessage("Error fetching vendor data");
      setIsError(true);
      setVendorLoaded(false); // Ensure it's false on error

      console.error(error);
    }
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !vendorId) {
      setMessage("userId and vendorId are required");
      setIsError(true);
      return;
    }

    const updateFields: { [key: string]: any } = {};
    if (vendorName) updateFields.vendor = vendorName;
    if (category) updateFields.category = category;
    if (phone) updateFields.vendorPhone = phone;
    if (deliveryTime) updateFields.DeliveryTime = parseFloat(deliveryTime);
    if (reliabilityScore) updateFields.ReliabilityScore = parseFloat(reliabilityScore);

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/update-vendor/", {
        userId,
        vendor_id: vendorId,
        vendor: vendorName,
        category,
        vendorPhone: phone,
        DeliveryTime: deliveryTime,
        ReliabilityScore: reliabilityScore,
      });

      setMessage(response.data.message || "Vendor updated successfully!");
      setIsError(false);
      console.log("Server Response:", response.data);
    } catch (error) {
      let errorMsg = "Failed to update vendor";
      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error ||
          error.message ||
          "Failed to update vendor";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      setMessage(errorMsg);
      setIsError(true);
      console.error("Update Vendor Error:", errorMsg);
    }
  };

  return (
    <div className="update-form-container">
      <form onSubmit={handleSubmit} className="update-form">
        <div className={`messageContainer ${message ? 'show' : ''} ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
          </div>
        </div>
        <div className="form-grid">


          {/* Basic Information Section */}
          <div className="form-section">

            <div className="form-group">
              <label>Vendor ID:</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  placeholder="Enter Vendor ID"
                  required
                />
       



         
              </div>
            </div>
            <div className="form-actions">

<button type="button" className="button-update" onClick={handleFetchVendor}>Load</button>
</div>
          </div>
          {/* Only show these fields after vendor is loaded */}
        {vendorLoaded && (
          <div className="form-section">

            <div className="form-group">
              <label>Vendor Name:</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Update name (optional)"
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Update category (optional)"
              />
            </div>
          </div>
          )}
        {vendorLoaded && (

          <div className="form-section">
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Update phone number (optional)"
              />
            </div>

            <div className="form-group">
              <label>Delivery Time (days):</label>
              <input
                type="number"
                step="0.1"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="Update delivery time (optional)"
              />
            </div>

            <div className="form-group">
              <label>Reliability Score (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={reliabilityScore}
                onChange={(e) => setReliabilityScore(e.target.value)}
                placeholder="Update score (optional)"
              />
            </div>
            
          </div>
           )}
          
        </div>
        {vendorLoaded && ( // Only show update button if vendor is loaded
          
          <div className="form-actions">
          <button type="submit">Update Product</button>
        </div>
        )}
      </form>

   
    </div>
  );
};

export default UpdateForm;