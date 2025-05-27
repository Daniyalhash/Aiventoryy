import React, {  useState } from "react";
import axios from "axios";
import "@/styles/form.css";
type AddInvoiceProps = {
  onSuccess: () => void;
};

const DelFormP : React.FC<AddInvoiceProps> = ({ onSuccess }) => {
  const [productId, setProductId] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !productId) {
      setMessage("Both userId and productId are required");
      setIsError(true);
      return;
    }
    console.log("user for delete",userId)

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/delete-product/", {
        userId,
        productname_id: productId,
      });
      console.log("Response:", response.data);
      console.log("user",userId)
      console.log("product id",productId)
      setMessage(response.data.message || "product deleted successfully!");
      setIsError(false);
      console.log("Server Response:", response.data);
                     // Delay a bit to show message, then close & refresh
        setTimeout(() => {
          onSuccess(); // Close modal and refresh page
        }, 1000);
    } catch (error) {
      let errorMsg = "Failed to delete product";
      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error ||
          error.message ||
          "Failed to delete product";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      setMessage(errorMsg);
      setIsError(true);
      console.error("Delete product Error:", errorMsg);
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
          <label>Product ID:</label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter Product ID"
            required
          />
        </div>
        </div>
        </div>
        
        <div className="form-actions">
    <button type="submit">Delete Product</button>
  </div>
      </form>

    </div>
  );
};

export default DelFormP;