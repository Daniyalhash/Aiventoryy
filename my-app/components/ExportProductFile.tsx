import React, { useState } from "react";
import axios from "axios";
import "@/styles/form.css";

// interface ExportResult {
//   filename: string;
//   success: boolean;
//   message: string;
// }
type AddInvoiceProps = {
  onSuccess: () => void;
};

const ExportProductFile : React.FC<AddInvoiceProps> = ({ onSuccess }) => {
  
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

 const handleExportVendors = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return alert("User ID missing");

  try {
    const response = await axios.get(
      "https://seal-app-8m3g5.ondigitalocean.app/aiventory/export_products/",
      {
        params: { user_id: userId },
        responseType: 'blob' // 🔥 This is critical for downloading files
      }
    );

    // Create a blob URL and trigger download
    const csvBlob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(csvBlob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setMessage("✅ Products exported successfully!");
      setIsError(false);
                         // Delay a bit to show message, then close & refresh
        setTimeout(() => {
          onSuccess(); // Close modal and refresh page
        }, 1000);


  } catch (error) {
     setMessage("🚨 Error exporting products: " + (error instanceof Error ? error.message : String(error)));
      setIsError(true);
  }
};

  return (
    <div className="search-form-container">
<form onSubmit={(e) => { e.preventDefault(); handleExportVendors(); }} className="search-form">
        {/* Message Container - Same as Login Page */}
        <div className={`messageContainer ${message ? 'show' : ''} ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
          </div>
        </div>

       
        <div className="form-actions">

          <button type="submit" className="search-button">
            Export CSV
          </button>
        </div>

      </form>



      
    </div>
  );
};

export default ExportProductFile;