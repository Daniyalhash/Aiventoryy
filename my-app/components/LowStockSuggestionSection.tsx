
import { faAngleLeft, faAngleRight, faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import "@/styles/low.css";
import axios from 'axios';

type LowStockProduct = {
  productname: string;
  category: string;
  stockquantity: number;
  productname_id: string;
  vendors: VendorDetails[];
  vendor_id?: string;
  costprice?: number;
};

type VendorDetails = {
  vendor_id: string;
  DeliveryTime: number;
  ReliabilityScore: number;
  vendor: string;
  vendorPhone: string;
};

// interface Suggestion {
//   productId: string;
//   productName: string;
//   currentStock: number;
//   recommendedStock: number;
//   vendors: VendorDetails[];
// }
const LowStockSuggestionSection: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;
  const [selectedProduct, setSelectedProduct] = useState<LowStockProduct | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vendorDetails, setVendorDetails] = useState<VendorDetails[] | null>(null);
  // const [orderStatus, setOrderStatus] = useState<{success: boolean, message: string} | null>(null);
  const [automateMode, setAutomateMode] = useState(false); // NEW STATE
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  useEffect(() => {
    const fetchLowStockProducts = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await axios.get('http://127.0.0.1:8000/aiventory/get-categories-p/', {
          params: { user_id: userId },
        });

        if (response.status === 200 && Array.isArray(response.data.low_stock_products)) {
          const sanitizedData = response.data.low_stock_products.map((product: any) => ({
            ...product,
            vendors: Array.isArray(product.vendors) ? product.vendors : [],
          }));
          setLowStockProducts(sanitizedData);
        } else {
          setError(response.data.error || "Unexpected response format.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Something went wrong. Please try again.");
      }
    };

    fetchLowStockProducts();
  }, []);

  const fetchVendorDetails = async (product: LowStockProduct) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/aiventory/get-vendor-details/', {
        params: {
          user_id: userId,
          category: product.category,
          vendor_id: product.vendor_id,
          productname: product.productname
        },
      });
      console.log("Vendor details response:", response.data); // Debugging line
      if (response.status === 200 && response.data.vendors && Array.isArray(response.data.vendors)) {
        const sortedVendors = response.data.vendors.sort((a: VendorDetails, b: VendorDetails) => {
          if (a.DeliveryTime !== b.DeliveryTime) {
            return a.DeliveryTime - b.DeliveryTime;
          }
          return b.ReliabilityScore - a.ReliabilityScore;
        });
        setVendorDetails(sortedVendors);
      } else {
        setError("Invalid vendor data received.");
        setVendorDetails(null);
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVendors = (product: LowStockProduct, index: number) => {
    if (selectedProductIndex === index) {
      setSelectedProductIndex(null);
      setVendorDetails(null);
      setSelectedProduct(null);
    } else {
      setSelectedProductIndex(index);
      fetchVendorDetails(product);
      setSelectedProduct(product);
    }
  };
  const handleConfirmOrder = async (vendor: VendorDetails) => {
    console.log("✅ Manual vendor confirm clicked", vendor);
    if (!selectedProduct) {
      setMessage("Please select a product first!");
      setIsError(true);
      return;
    }

    // Early return if prediction is needed first
    if (!selectedProduct.stockquantity) {
      setMessage("Stock quantity not available for prediction!");
      setIsError(true);
      return;
    }

    try {
      setMessage("Processing your order...");
      setIsError(false);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];


      const today = new Date();
      const currentMonthIndex = today.getMonth(); // 0-11
      const currentMonthName = monthNames[currentMonthIndex];

      // Check if today is the last day of the month
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const isMonthEnded = tomorrow.getMonth() !== today.getMonth();

      const selectedMonth = isMonthEnded
        ? monthNames[(currentMonthIndex + 1) % 12]
        : currentMonthName;

      console.log("📅 Selected Month:", selectedMonth);
      console.log("user id ", userId)
      // Prepare data for prediction API
      const predictionPayload = {
        user_id: userId,
        productname: selectedProduct.productname,
        sellingprice: selectedProduct.costprice || 0,
        category: selectedProduct.category,
        selectedMonth: selectedMonth, // Adjust if required
        productname_id: selectedProduct.productname_id,
      };
      console.log("inovide predictions", predictionPayload)
      // Send prediction request
      const predictionResponse = await axios.post('http://127.0.0.1:8000/aiventory/predict_demand/', predictionPayload);

      if (predictionResponse.status >= 200 && predictionResponse.status < 300) {
        const predictedQuantity = predictionResponse.data.prediction || 0; // Use prediction or fallback to 0

        // If stock quantity is low, modify it based on prediction
        if (selectedProduct.stockquantity < predictedQuantity) {
          setMessage("Stock quantity is low. We will adjust the order based on predicted demand.");
        }

        // Prepare data for placing the order
        const orderPayload = {
          vendor_id: vendor.vendor_id,
          vendor: vendor.vendor,
          vendorPhone: vendor.vendorPhone,
          date: new Date().toISOString().split("T")[0],
          products: [{
            name: selectedProduct.productname,
            category: selectedProduct.category,
            quantity: predictedQuantity || selectedProduct.stockquantity,
            price: selectedProduct.costprice || 0,
          }],
          user_id: localStorage.getItem("userId")
        };

        // Debug: Log order payload before sending
        console.log('6. Order payload with vendor_id:', {
          ...orderPayload,
          vendor_id_type: typeof orderPayload.vendor_id,
          vendor_id_value: orderPayload.vendor_id
        });
        // Place the order
        const orderResponse = await axios.post('http://127.0.0.1:8000/aiventory/save-invoice/', orderPayload);

        if (orderResponse.status >= 200 && orderResponse.status < 300) {
          setMessage("Order placed successfully! Redirecting...");
          setIsError(false);

          // Add debug logging
          console.log("Order success response:", orderResponse.data);

          // Refresh data
          if (selectedProduct) {
            await fetchVendorDetails(selectedProduct);
          }
        } else {
          throw new Error(orderResponse.data?.message || "Order processed but with unexpected response");
        }
      } else {
        throw new Error(predictionResponse.data?.message || "Prediction failed, please try again later.");
      }
    } catch (error) {
      // Enhanced error diagnostics
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-ignore
        console.error("Order placement error:", {
          error,
          // @ts-ignore
          response: error.response?.data
        });
      } else {
        console.error("Order placement error:", { error });
      }

      let errorMsg = "Order may have been placed - please verify";

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: any; request?: any };
        // Handle cases where backend succeeds but returns non-200
        if (err.response && err.response.status >= 200 && err.response.status < 300) {
          errorMsg = "Order processed successfully!";
          setIsError(false);
        } else if (err.response) {
          errorMsg = err.response.data?.message || `Server responded with ${err.response.status}`;
        }
      } else if (typeof error === "object" && error !== null && "request" in error) {
        errorMsg = "Network error - order may have been placed";
      }

      setMessage(errorMsg);
      setIsError(
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response?.status === "number"
          ? (error as any).response.status >= 400
          : true
      );
    }
  };

  const filteredProducts = lowStockProducts.filter(product =>
    product.productname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const getReliabilityClass = (score: number) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const getVendorTag = (deliveryTime: number, reliabilityScore: number, allVendors: VendorDetails[]) => {
    // const maxReliability = Math.max(...allVendors.map(v => v.ReliabilityScore));
    const maxDeliveryTime = Math.max(...allVendors.map(v => v.DeliveryTime)); // highest days = worst

    // Normalize scores
    const reliabilityWeight = reliabilityScore / 100; // 0 to 1
    const deliveryWeight = (maxDeliveryTime - deliveryTime) / maxDeliveryTime || 1; // 1 is fastest (0 days)

    // Weighted final score
    const finalScore = (0.7 * reliabilityWeight) + (0.3 * deliveryWeight); // Tune weights here

    if (finalScore >= 0.85) {
      return { tag: "Best Recommended", className: "best-recommended" };
    } else if (finalScore >= 0.75) {
      return { tag: "Slightly Best", className: "slightly-best" };
    } else if (finalScore >= 0.65) {
      return { tag: "Good", className: "good" };
    } else if (finalScore >= 0.5) {
      return { tag: "Slightly Good", className: "slightly-good" };
    } else if (finalScore >= 0.4) {
      return { tag: "Least Good", className: "least-good" };
    } else {
      return { tag: "Worst", className: "worst" };
    }
  };
  // const handleBestVendorSelected = (vendor) => {
  //   console.log("✅ Best vendor selected:", vendor);
  //   // You can add more logic here later if needed
  // };
  const [isAllSelected, setIsAllSelected] = useState(false);
  // const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // Adjust type as needed

  // const handleSelectAll = (e) => {
  //   const isChecked = e.target.checked;
  //   setIsAllSelected(isChecked);
  //   if (isChecked) {
  //     console.log("wow")

  //   } else {
  //     // Clear selection
  //     console.log("no")
  //   }
  // };

  const handleBestConfirmOrder = async (vendor: VendorDetails) => {
    console.log("✅ Best vendor confirm clicked", vendor);
    if (!selectedProduct) {
      setMessage("Please select a product first!");
      setIsError(true);
      return;
    }

    
    // You can customize behavior here if needed
    // For now, we'll reuse the same logic but with a different message
    try {
      setMessage("Processing your order...");
      setIsError(false);

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];


      const today = new Date();
      const currentMonthIndex = today.getMonth(); // 0-11
      const currentMonthName = monthNames[currentMonthIndex];

      // Check if today is the last day of the month
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const isMonthEnded = tomorrow.getMonth() !== today.getMonth();

      const selectedMonth = isMonthEnded
        ? monthNames[(currentMonthIndex + 1) % 12]
        : currentMonthName;

      console.log("📅 Selected Month:", selectedMonth);
      console.log("user id ", userId)
      // Prepare data for prediction API
      const predictionPayload = {
        user_id: userId,
        productname: selectedProduct.productname,
        sellingprice: selectedProduct.costprice || 0,
        category: selectedProduct.category,
        selectedMonth: selectedMonth, // Adjust if required
        productname_id: selectedProduct.productname_id,
      };
      console.log("inovide predictions", predictionPayload)
      // Send prediction request
      const predictionResponse = await axios.post('http://127.0.0.1:8000/aiventory/predict_demand/', predictionPayload);

      if (predictionResponse.status >= 200 && predictionResponse.status < 300) {
        const predictedQuantity = predictionResponse.data.prediction || 0; // Use prediction or fallback to 0

        // If stock quantity is low, modify it based on prediction
        if (selectedProduct.stockquantity < predictedQuantity) {
          setMessage("Stock quantity is low. We will adjust the order based on predicted demand.");
        }


      setMessage("Automated order placed successfully!");
      setIsError(false);

      const orderPayload = {
        vendor_id: vendor.vendor_id,
        vendor: vendor.vendor,
        vendorPhone: vendor.vendorPhone,
        date: new Date().toISOString().split("T")[0],
        products: [{
          name: selectedProduct?.productname || "",
          category: selectedProduct?.category || "",
          quantity: selectedProduct?.stockquantity || 0,
          price: selectedProduct?.costprice || 0,
        }],
        user_id: localStorage.getItem("userId")
      };

      const orderResponse = await axios.post('http://127.0.0.1:8000/aiventory/automate_order/', orderPayload);

      if (orderResponse.status >= 200 && orderResponse.status < 300) {
      setMessage("✅ Automated order placed successfully!");
      setIsError(false);
      if (selectedProduct) {
        await fetchVendorDetails(selectedProduct); // Refresh vendors
      }
    } else {
      setMessage("⚠️ Order processed but with unexpected response.");
      setIsError(true);
    }
  }
  } catch (error) {
    if (error && typeof error === "object" && "message" in error) {
      // @ts-ignore
      console.error("🚨 Error in automated order flow:", error.message, (error as any).response?.data);
    } else {
      console.error("🚨 Error in automated order flow:", error);
    }
    setMessage("⚠️ Failed to complete automated order. Please check logs or retry.");
    setIsError(true);
  }
};

  const renderVendors = () => {
    if (loading) return <div className="loading-spinner"></div>;
    if (!vendorDetails || vendorDetails.length === 0) return <p className="no-vendors">No vendors available</p>;



    // If in automate mode, show only best vendor
    let vendorsToShow = vendorDetails;
    if (automateMode) {
      vendorsToShow = vendorDetails
        .filter(vendor => getVendorTag(vendor.DeliveryTime, vendor.ReliabilityScore, vendorDetails).tag === "Best Recommended");

      // Fallback: pick the one with highest score if no "Best Recommended"
      if (vendorsToShow.length === 0) {
        vendorsToShow = [vendorDetails.reduce((prev, current) =>
          (getVendorTag(prev.DeliveryTime, prev.ReliabilityScore, vendorDetails).tag === "Best Recommended" ||
            prev.ReliabilityScore > current.ReliabilityScore) ? prev : current
        )];
      }
      //     if (vendorsToShow.length > 0) {
      //   handleBestVendorSelected(vendorsToShow[0]);
      // }
    }


    return (
      <div className="vendors-grid">
        {vendorsToShow.map((vendor, index) => {
          const { tag, className } = getVendorTag(vendor.DeliveryTime, vendor.ReliabilityScore, vendorDetails);
          return (
            <div key={index} className="vendor-card">
              <div className="vendor-header">
                <h4>{vendor.vendor}</h4>
                <span className={`reliability-badge ${getReliabilityClass(vendor.ReliabilityScore)}`}>
                  {vendor.ReliabilityScore}/100
                </span>
                <span className={`vendor-tag ${className}`}>{tag}</span>
              </div>
              <div className="vendor-details">
                <p><span>Delivery:</span> {vendor.DeliveryTime} days</p>
                <p><span>Phone:</span> {vendor.vendorPhone}</p>
              </div>
              <button
                className="order-button"
                onClick={() => {
                  if (automateMode) {
                    handleBestConfirmOrder(vendor); // Use new function
                  } else {
                    handleConfirmOrder(vendor);     // Use original function
                  }
                }}
                disabled={loading}
              >
                {loading ? "Processing..." : automateMode ? "Auto Order" : "Place Order"}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="low-stock-container">
      <div className={`messageContainer ${message ? 'show' : 'hide'} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>
      {/* {orderStatus && (
        <div className={`order-status ${orderStatus.success ? 'success' : 'error'}`}>
          {orderStatus.message}
        </div>
      )} */}

      <div className="header-section">
        <div className="search-head">
          <h2 className="section-title">Low Stock Products ({filteredProducts.length})</h2>

          <div className="checkbox-wrapper">
            <label htmlFor="selectAll" className="checkbox-label">
              <input
                type="checkbox"
                id="selectAll"
                checked={isAllSelected}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setIsAllSelected(isChecked);
                  setAutomateMode(isChecked); // Toggle automate mode with checkbox
                  if (isChecked && selectedProduct) {
                    fetchVendorDetails(selectedProduct); // Fetch again in case we need filtered vendors
                  }
                }}
              />
              <span className="custom-checkbox"></span>
              Automate Orders    </label>
          </div>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="products-list">
        {currentProducts.length > 0 ? (
          currentProducts.map((product, index) => (
            <div
              key={index}
              className={`product-card ${selectedProductIndex === index ? 'expanded' : ''}`}
            >
              <div
                className="product-summary"
                onClick={() => handleToggleVendors(product, index)}
              >
                <div className="product-info">
                  <h3>{product.productname}</h3>
                  <p className="category">{product.category}</p>
                </div>
                <div className="stock-info">
                  <span className="stock-quantity">{product.stockquantity} Unit left in Stock</span>
                  <FontAwesomeIcon
                    icon={selectedProductIndex === index ? faChevronUp : faChevronDown}
                    className="toggle-icon"
                  />
                </div>
              </div>

              {selectedProductIndex === index && (
                <div className="vendor-section">
                  {automateMode && <div className="automate-mode-label">Showing only best recommended vendor</div>}
                  {/* <h4 className="vendor-title">Available Vendors (Sorted by Fastest Delivery)</h4> */}
                  {renderVendors()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No low stock products found</p>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <FontAwesomeIcon icon={faAngleLeft} /> Previous
        </button>

        <span className="page-indicator">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-button"
        >
          Next <FontAwesomeIcon icon={faAngleRight} />
        </button>
      </div>
    </div>
  );
};

export default LowStockSuggestionSection;