import React, { useState } from "react";
import axios from "axios";
import "@/styles/form.css";
type Product = {
  productname_id: string;
  productname: string;
  category: string;
  subcategory: string;
  stockquantity: number;
  reorderthreshold: number;
  costprice: number;
  sellingprice: number;
  timespan: string;
  expirydate: string;
  monthly_sales: number;
  Barcode: string;
  vendor_id: string;
  productSize: string;
  sale_date: string;
  season: string;
  last_updated: string;
};
// import "@/styles/SearchForm.css"; // Optional styling
const SearchFormP = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [category, setCategory] = useState("");
const [results, setResults] = useState<Product[]>([]);
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
      const response = await axios.post("http://localhost:8000/aiventory/search-product/", {
        userId,
        productName,
        productId,
        category,
      });

      const data = response.data;
      console.log("Search Product Response:", data);
      if (data.matchedProducts && data.matchedProducts.length > 0) {
        setResults(data.matchedProducts);

        setMessage(`${data.totalMatches} Product(s) found`);
        setIsError(false);
      } else {
        setResults([]);
        setMessage("No matching Product found");
        setIsError(true);
      }
    } catch (error) {
      let errorMsg = "Failed to search Product";

  if (axios.isAxiosError(error)) {
    errorMsg = error.response?.data?.error || error.message;
  } else if (error instanceof Error) {
    errorMsg = error.message;
  }


      setMessage(errorMsg);
      setIsError(true);
      console.error("Search Product Error:", errorMsg);
      setResults([]);
    }
  };

  return (
    <div className="search-form-container2">
      <form onSubmit={handleSubmit} className="search-form2">
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
            <label>Product Name:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Search by name (optional)"
            />
          </div>
          </div>

        </div>
        <div className="form-actions">
          <button type="submit">Search Product</button>
        </div>
      </form>

  

      {/* Results Table */}
      {results.length > 0 && (
        <div className="search-results">
          <h3>Matching Vendors</h3>
          <table className="vendors-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>subcategory</th>
                <th>stockquantity</th>
                <th>reorderthreshold</th>
                <th>costprice</th>
                <th>sellingprice</th>
                <th>timespan</th>
                <th>expirydate</th>
                <th>monthly_sales</th>
                <th>Barcode</th>
                <th>vendor_id</th>
                <th>productSize</th>
                <th>sale_date</th>
                <th>season</th>
                <th>last_updated</th>
              </tr>
            </thead>
            <tbody>
              {results.map((product, index) => (
                <tr key={index}>
                  <td>{product.productname_id}</td>
                  <td>{product.productname}</td>
                  <td>{product.category}</td>
                  <td>{product.subcategory}</td>
                  <td>{product.stockquantity}</td>
                  <td>{product.reorderthreshold}</td>
                  <td>{product.costprice}</td>
                  <td>{product.sellingprice}</td>
                  <td>{product.timespan}</td>
                  <td>{product.expirydate}</td>
                  <td>{product.monthly_sales}</td>
                  <td>{product.Barcode}</td>
                  <td>{product.vendor_id}</td>
                  <td>{product.productSize}</td>
                  <td>{product.sale_date}</td>
                  <td>{product.season}</td>
                  <td>{product.last_updated}</td>


                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchFormP;