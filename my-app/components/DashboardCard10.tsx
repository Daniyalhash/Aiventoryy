import React, { useState, useEffect } from 'react';
import '../src/styles/dashboardCard9.css';
import axios from "axios";
import { fetchCategories } from "@/utils/api";
import useSWR from 'swr';


type Prediction = {
  productname: string;
  category: string;
  stockquantity: number;
  monthly_sales: number;

  needs_reorder: string;
};


// const DashboardCard10 = ({ title, link, subTitle }) => {
const DashboardCard10 = ({ title }: { title: string }) => {

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

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);

 const { data: categoryData } = useSWR(
  userId ? ["get-categories", userId] : null,
  () => fetchCategories(userId),
  {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 30000,
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
  const fetchPredictions = async () => {
  setLoading(true);
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("User ID not found");

    const response = await axios.get(
      "https://seal-app-8m3g5.ondigitalocean.app/aiventory/fetch_smart_reorder_products/",
      {
        params: {
          user_id: userId,
          category: selectedCategory !== "all" ? selectedCategory : undefined
        }
      }
    );

    const data = response.data;
    console.log("product u want to reorder", data);
    // Map backend response to Prediction type
    const predictionList = Array.isArray(data.data)
      ? data.data.map((item: any) => ({
          productname: item.productname || "Unknown",
          category: item.category || "Uncategorized",
          stockquantity: item.stockquantity || 0,
          monthly_sales: item.monthly_sales || new Date().toISOString(),
         
          needs_reorder: item.needs_reorder ? "High" : "Low",
         
        }))
      : [];

    console.log("Fetched reorder products:", predictionList.length);

    if (data.status === 'success' && predictionList.length > 0) {
      setPredictions(predictionList);
      setError(null);
      setIsError(false);
    } else {
      setError("No products found.");
      setPredictions([]);
    }

  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    console.error("Error fetching reorder products:", err);
    setError(error?.response?.data?.message || "Failed to fetch reorder products.");
    setPredictions([]);
    setIsError(true);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPredictions();
  }, []);
  // console.log("found these val", predictions, length)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
      let results = [...predictions];

    if (selectedCategory === "all") {
      setFilteredPredictions(predictions);
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
  }, [selectedCategory, debouncedSearchTerm, predictions]);

  // console.log(`Filtered count for "${selectedCategory}":`, filteredPredictions.length);

  // Function to handle deleting an invoice
  useEffect(() => {
    setVisibleCount(10); // Reset count when selectedCategory changes
  }, [selectedCategory]);
  useEffect(() => {
    let results = [...predictions];

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
  }, [selectedCategory, searchTerm, predictions]);
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
    <div className="card9">
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
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Monthly Sales</th>
                

                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.length > 0 ? (
                <>
                  {/* Render only visible predictions */}
                  {filteredPredictions.slice(0, visibleCount).map((item, index) => {
                   

                    return (
                      <tr key={index}>
                        <td>{item.productname}</td>
                        <td>{item.category}</td>
                        <td>{item.stockquantity}</td>
                        <td>{item.monthly_sales}</td>
                  
                        <td>{item.needs_reorder || "–"}</td>
                        {/* <td>
                          {item.risk_level && !item.risk_level.toLowerCase().includes("low") ? (
                            <button className="receivedBtn19">Discount Now</button>
                          ) : (
                            <span className="deleteBtn19">–</span>
                          )}
                        </td> */}
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
                      ? `No predictions found for "${searchTerm}" in "${selectedCategory}".`
                      : `No predictions found for "${selectedCategory}".`}
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

export default DashboardCard10;
