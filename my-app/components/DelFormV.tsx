import React, {  useState } from "react";
import axios from "axios";
import "@/styles/form.css";
type AddInvoiceProps = {
  onSuccess: () => void;
};
const DelForm : React.FC<AddInvoiceProps> = ({ onSuccess }) => {
  const [vendorId, setVendorId] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !vendorId) {
      setMessage("Both userId and vendorId are required");
      setIsError(true);
      return;
    }
    console.log("user for delete", userId)

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/delete-vendor/", {
        userId,
        vendor_id: vendorId,
      });
      console.log("Response:", response.data);
      console.log("user", userId)
      console.log("vendor id", vendorId)
      setMessage(response.data.message || "Vendor deleted successfully!");
      setIsError(false);
      console.log("Server Response:", response.data);
                       // Delay a bit to show message, then close & refresh
        setTimeout(() => {
          onSuccess(); // Close modal and refresh page
        }, 1000);
    } catch (error) {
      let errorMsg = "Failed to delete vendor";
      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error ||
          error.message ||
          "Failed to delete vendor";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setMessage(errorMsg);
      setIsError(true);
      console.error("Delete Vendor Error:", errorMsg);
    }
  };

  return (
    <div className="del-form-container">
      <form onSubmit={handleSubmit} className="del-form2">
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
                placeholder="Enter Vendor ID"
                required
              />
            </div>
          </div>

        </div>

        <div className="form-actions">

          <button type="submit" className="delete-button">
            Delete Vendor
          </button>
        </div>

      </form>

    
    </div>
  );
};

export default DelForm;