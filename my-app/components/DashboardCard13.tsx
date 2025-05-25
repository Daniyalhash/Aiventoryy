import React, { useState, useEffect } from 'react';
import '../src/styles/dashboardCard9.css';
import axios from "axios";
import { fetchCategories } from "@/utils/api";
import useSWR from 'swr';


type ExpiredProduct = {
  product_id: string;
  productname: string;
  category: string;
  expirydate: string;
};


// const DashboardCard10 = ({ title, link, subTitle }) => {
const DashboardCard13 = ({ title }: { title: string }) => {

  const [loading, setLoading] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const loadMore = () => setVisibleCount(prev => prev + 10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("Toothpaste");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  const [error, setError] = useState<string | null>(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success

  const [expiredProducts, setExpiredProducts] = useState<ExpiredProduct[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<ExpiredProduct[]>([]);
  const { data: categoryData } = useSWR(
    userId ? ["get-categories", userId] : null,
    () => fetchCategories(userId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 30000, // only fetch once every 30s max
    }
  );
  useEffect(() => {
    if (categoryData) {
      const formatted = categoryData.categories.map((cat: string, index: number) => ({
        _id: `cat-${index}`, // fallback ID
        name: cat
      }));
      setCategories(formatted); // ✅ Now dropdown will show options
    }
  }, [categoryData]);
  console.log("available categories", categories)
  const fetchExpiryProducts = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) throw new Error("User ID not found");

      const response = await axios.get("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_expired_products/", {
        params: {
          user_id: userId,
          category: selectedCategory !== "all" ? selectedCategory : undefined
        }
      });

      const data = response.data;

      // console.log("Fetched  values:", predictionList.length);

      if (data.status === 'success' && Array.isArray(data.data)) {
        setExpiredProducts(data.data);
        setError(null);
        setIsError(false); // On success

      } else {
        setError("No predictions found in the response.");
        setExpiredProducts([]);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching Expired Products:", err);
      setError(error?.response?.data?.message || "Failed to fetch Expired Products.");
      setExpiredProducts([]);
      setIsError(true); // Inside catch

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryProducts();
  }, []);
  // console.log("found these val", predictions, length)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const handleDelete = async (productId: string) => {
    // if (!window.confirm("Are you sure you want to delete this product?")) return;
    console.log("Sending delete request with:", {
      productname_id: productId,
      userId: userId
    });
    try {
      await await axios.post(
        "https://seal-app-8m3g5.ondigitalocean.app/aiventory/delete-product/ ",
        { productname_id: productId, userId: userId }, // ← Send raw object, no `.data` wrapper
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Remove from state
      setExpiredProducts(prev =>
        prev.filter(p => p.product_id !== productId)
      );

      setMessage("Product deleted successfully.");
      setIsError(false)

    } catch (err) {
      console.error("Error deleting product:", err);
      setMessage("Failed to delete product.");
      setIsError(true)
    }
  };
  useEffect(() => {
    let results = [...expiredProducts];

    if (selectedCategory === "all") {
      setFilteredPredictions(expiredProducts);
    } else {
      setFilteredPredictions(
        results = results.filter(
          (p) =>
            p.category &&
            p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        )
      );

    }
    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      results = results.filter((p) =>
        p.productname?.toLowerCase().includes(lowercasedTerm)
      );
    }

    setFilteredPredictions(results);
    setVisibleCount(10);
  }, [selectedCategory, debouncedSearchTerm, expiredProducts]);

  // console.log(`Filtered count for "${selectedCategory}":`, filteredPredictions.length);

  // Function to handle deleting an invoice
  useEffect(() => {
    setVisibleCount(10); // Reset count when selectedCategory changes
  }, [selectedCategory]);
  useEffect(() => {
    let results = [...expiredProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      results = results.filter(
        (p) =>
          p.category &&
          p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }

    // Filter by product name
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter((p) =>
        p.productname?.toLowerCase().includes(lowercasedTerm)
      );
    }

    setFilteredPredictions(results);
    setVisibleCount(10); // Reset visible count when filters change
  }, [selectedCategory, searchTerm, expiredProducts]);
  function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }

  // Use inside component:
  return (
    <div className="card9 red">
      {message && (
        <div className={`messageContainer show ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
            {isError && (
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
      <div className="cardHeader9">
        <h3 className="cardTitle9">{title}</h3>
        {/* <h3 className='cardTitle19'>
          {subTitle}
        </h3> */}
        <div className="cardSide">
          {/* <div className="form-group2">
            <input
              type="text"
              name="productName"
              placeholder="Search by Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> */}
          <div className="form-group2">
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >

              <option value="">-- Select Category --</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      <div className="tableWrapper9">
        {loading ? (
          <div className="centered-message">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="centered-message">
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <table className="orderTable9">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Expiry Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.length > 0 ? (
                <>
                  {/* Render only visible predictions */}
                  {filteredPredictions.slice(0, visibleCount).map((item, index) => {
                    const expiryDate = new Date(item.expirydate);
                    const today = new Date();
                    const timeDiff = expiryDate.getTime() - today.getTime();
                    const daysLeft = Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)), 0);

                    return (
                      <tr key={index}>
                        <td>{item.product_id}</td>
                        <td>{item.productname}</td>
                        <td>{item.category}</td>
                        <td>{item.expirydate}</td>
                        <td>
                          <button
                            className="deleteBtn19"
                            onClick={() => handleDelete(item.product_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Show Load More Button if more items are available */}
                  {visibleCount < filteredPredictions.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center' }}>
                        <button onClick={loadMore} className="load-more-btn">
                          Load More
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    {searchTerm
                      ? `No expiry found for "${searchTerm}" in "${selectedCategory}".`
                      : `No expiry found for "${selectedCategory}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="load-status">
        Showing {Math.min(visibleCount, filteredPredictions.length)} of {filteredPredictions.length} predictions
      </div>
    </div>
  );
};

export default DashboardCard13;
