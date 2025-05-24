import React, { useState } from "react";
import axios from "axios";
import "@/styles/form.css";

const UpdateFormP = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [timespan, setTimespan] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [monthlySales, setMonthlySales] = useState("");
  const [barcode, setBarcode] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [productSize, setProductSize] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [season, setSeason] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [productLoaded, setProductLoaded] = useState(false); // New state to track if vendor is loaded

  const handleFetchProduct = async () => {
    if (!userId || !productId) {
      setMessage("User ID and Product ID are required to fetch product data.");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-product-ids/", {
        userId,
        productId,
      });
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };
      
      console.log("Server Response:", response.data); // Log the server response
      const product = response.data.product;
      if (product) {
        setProductName(product.productname || "");
        setCategory(product.category || "");
        setSubcategory(product.subcategory || "");
        setStockQuantity(product.stockquantity?.toString() || "");
        setReorderThreshold(product.reorderthreshold?.toString() || "");
        setCostPrice(product.costprice?.toString() || "");
        setSellingPrice(product.sellingprice?.toString() || "");
        setTimespan(formatDateForInput(product.timespan));
        setExpiryDate(product.expirydate || "");
        setMonthlySales(product.monthly_sales?.toString() || "");
        setBarcode(product.Barcode || "");
        setVendorId(product.vendor_id || "");
        setProductSize(product.productSize || "");
        setSaleDate(product.sale_date || "");
        setSeason(product.season || "");
        console.log("Product Data:", product.timespan); // Log the product data
        setMessage("Product loaded successfully.");
        setIsError(false);
        setProductLoaded(true); // Product was found and loaded
      } else {
        setMessage("Product not found.");
        setIsError(true);
        setProductLoaded(false);
      }
    } catch (error) {
      setMessage("Error fetching product data.");
      setIsError(true);
      setProductLoaded(false);
      console.error(error);
    }
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !productId) {
      setMessage("userId and productId are required");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/update-product/", {
        userId,
        productname_id: productId,
        productname: productName,
        category,
        subcategory,
        stockquantity: stockQuantity,
        reorderthreshold: reorderThreshold,
        costprice: costPrice,
        sellingprice: sellingPrice,
        timespan,
        expirydate: expiryDate,
        monthly_sales: monthlySales,
        Barcode: barcode,
        vendor_id: vendorId,
        productSize,
        sale_date: saleDate,
        season,
      });

      setMessage(response.data.message || "Product updated successfully!");
      setIsError(false);
      console.log("Server Response:", response.data);
    } catch (error) {
      
let errorMsg = "Failed to update product";
      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error ||
          error.message ||
          "Failed to update product";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setMessage(errorMsg);
      setIsError(true);
      console.error("Update Product Error:", errorMsg);
    }
  };

  return (
    <div className="update-form-container">
      <form onSubmit={handleSubmit} className="update-form2">
        {/* Message Container - Same as Login Page */}
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
              <label>Product ID:</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID"
                required
              />
            </div>
            <div className="form-actions">

<button type="button" className="button-update" onClick={handleFetchProduct}>Load</button>
</div>
          </div>
          {productLoaded && (

          <div className="form-section">

            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Update product name (optional)"
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
              />
            </div>

            <div className="form-group">
              <label>Subcategory:</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Subcategory"
              />
            </div>
          </div>
  )}
            {productLoaded && (

          <div className="form-section">
            <div className="form-group">
              <label>Stock Quantity:</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Stock Quantity"
              />
            </div>

            <div className="form-group">
              <label>Reorder Threshold:</label>
              <input
                type="number"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(e.target.value)}
                placeholder="Reorder Threshold"
              />
            </div>







            <div className="form-group">
              <label>Product Size:</label>
              <input
                type="text"
                value={productSize}
                onChange={(e) => setProductSize(e.target.value)}
                placeholder="Product Size"
              />
            </div>
            <div className="form-group">
              <label>Barcode:</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Barcode"
              />
            </div>
          </div>
        )}
                    {productLoaded && (

          <div className="form-section">
            <div className="form-group">
              <label>Cost Price:</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Cost Price"
              />
            </div>

            <div className="form-group">
              <label>Selling Price:</label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="Selling Price"
              />
            </div>



            <div className="form-group">
              <label>Monthly Sales:</label>
              <input
                type="number"
                value={monthlySales}
                onChange={(e) => setMonthlySales(e.target.value)}
                placeholder="Monthly Sales"
              />
            </div>


          </div>
          )}
                    {productLoaded && (
          <div className="form-section">
            <div className="form-group">
              <label>Timespan:</label>
              <input
                type="date"
                value={timespan}
                onChange={(e) => setTimespan(e.target.value)}
                placeholder="Timespan"
              />
            </div>

            <div className="form-group">
              <label>Expiry Date:</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Sale Date:</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Vendor ID:</label>
              <input
                type="text"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="Vendor ID"
              />
            </div>
          </div>
 )}
                     {productLoaded && (

          <div className="form-section">
            {/* Additional Info Section */}

            <div className="form-group">
              <label>Season:</label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Season"
              />
            </div>
          </div>
)}
        </div>
        {productLoaded && (
        <div className="form-actions">
          <button type="submit">Update Product</button>
        </div>
        )}
      </form>


    </div>
  );
};

export default UpdateFormP;
