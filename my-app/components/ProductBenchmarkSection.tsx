import "@/styles/ProductBenchmarkSection.css";
import { useState, useEffect } from "react";
import ComparisonChart from "./ComparisonChart";
import axios from 'axios';
import { fetchCategories, fetchProductsByCategory } from "@/utils/api";
import ProfitMarginChart from "@/components/ProfitMarginChart";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useSWR from 'swr';
import { faPlus, faTimes, faSearch, faChartLine, faBoxOpen, faTruck, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';


export default function ProductBenchmarkSection() {
  type Product = {
    id: string;
    productname: string;
    [key: string]: any; // Add other properties as needed
  };

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  // const [product, setProduct] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; productname: string } | null>(null);
  const [UseCategory, setUseCategory] = useState("");
  const [chartData2, setChartData2] = useState<Array<{ name: string; value: number }>>([]);
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [targetProductDetails, setTargetProductDetails] = useState<Product | null>(null);
  const [applyClicked, setApplyClicked] = useState(false);
  const [isProductSelected, setIsProductSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [range, setRange] = useState('1-5'); // Default range
  const [range2, setRange2] = useState('1-5'); // Default range
  const [allProducts, setAllProducts] = useState([]); // For storing all products

  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success

  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
const [isAnimating] = useState(false);


  // fetching just categories using SWR

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
      setCategories(categoryData.categories || []);
    }
  }, [categoryData]);


  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      const data = await fetchCategories(userId);
      if (isMounted) {
        setCategories(data.categories || []);
      }
    };

    if (userId) loadCategories();

    return () => {
      isMounted = false;
    };
  }, [userId]);





  const {
    data: topProductsData
   
  } = useSWR(
    selectedCategory ? ["get-top-products-by-category", userId, selectedCategory] : null,
async ([, userId, category]) => {
      const response = await axios.get(
        'https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-top-products-by-category/',
        { params: { user_id: userId, category } }
      );
      return response.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30s
    }
  );

  useEffect(() => {
    if (topProductsData) {
     const products = topProductsData.products || [];
     if (products.length === 0) {
      console.log("No products found for the selected category.");
    }
    console.log("ddd", products);
    setAllProducts(products);
    setProducts(products.slice(0, 5));
    }
  }, [topProductsData]);


  // Apply selected product to comparison
  const handleApplyProduct = () => {
    // Check if a category is selected or manually entered
    const category = selectedCategory || UseCategory;
    if (!category) {
      setMessage("Please select or enter a category.");
      setIsError(true)
      setTimeout(() => setError(null), 2000); // Clear error after 2 seconds
      return;
    }

    // Check if a product is selected
    if (!isProductSelected) {
      setMessage("Please select a product to compare.");
      setIsError(true)

      setTimeout(() => setError(null), 2000); // Clear error after 2 seconds
      return;
    }

    // Set applyClicked to true to show the comparison view
    setApplyClicked(true);

    // Validate that a product is selected
    if (!selectedProduct) {
      setMessage("Please select a product first.");
      setIsError(true)
      return;
    }

    // Fetch comparison data using the selected or manually entered category
    if (selectedProduct) {
      fetchComparisonData(
        { vendor_id: (selectedProduct as any).vendor_id || (selectedProduct as any).id, productname: selectedProduct.productname },
        category
      );
    }
  };
  // Fetch products for comparison
  const fetchComparisonData = async (
    product: { vendor_id: string; productname: string },
    category: string
  ) => {
    setLoading(true);

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('User ID is missing');
      setIsError(true)
      setLoading(false);
      return;
    }

    try {

      const vendor_id = product.vendor_id
      // Get all products in the same category, including the selected product
      const response = await axios.get('https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-products-by-name/', {
        params: { user_id: userId, category: category, vendor_id: vendor_id },
      });
      console.log("Vendor ID used in API call:", vendor_id, typeof vendor_id);  // should be "string"
      console.log("Selected Vendor ID:", vendor_id);

      if (response.status === 200 && response.data.products) {

        const products = response.data.products;
        const targetProduct = products.find((p: any) => p.productname === product.productname);

        if (targetProduct) {
          // Ensure the target product is always included and appears first
          setTargetProductDetails(targetProduct); // Save target product details
          const comparisonData = [targetProduct, ...products.filter((prod: any) => prod.productname !== product.productname)].map((prod: any) => ({
            name: prod.productname,
            value: prod.sellingprice,
          }));
          // Ensure the target product is always included and appears first
          const comparisonData2 = [targetProduct, ...products.filter((prod: any) => prod.productname !== product.productname)].map((prod: any) => ({
            name: prod.productname,
            value: prod.profitmargin,
          }));

          setChartData(comparisonData);
          setChartData2(comparisonData2)
          setRange(getRangeBasedOnSize(products.length)); // Dynamically set range
        }
      } else {
        setError(response.data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error("API call failed:", error);
      setError('Error  comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set range based on the number of products
  const getRangeBasedOnSize = (numProducts: number) => {
    if (numProducts > 50) {
      return '1-60';
    } else if (numProducts > 20) {
      return '1-20';
    } else {
      return '1-5';
    }
  };
  // use for changing range
  const handleRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRange(event.target.value);
  };
  const handleRangeChange2 = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRange2(event.target.value);
  };

  const generateRangeOptions = (dataLength: number) => {
    const options: string[] = [];
    if (dataLength === 0) return options; // Handle empty data case

    for (let i = 5; i <= dataLength; i += 5) {
      options.push(`1-${Math.min(i, dataLength)}`); // Ensure max doesn't exceed dataLength
    }
    if (!options.includes(`1-${dataLength}`) && dataLength > 0) {
      options.push(`1-${dataLength}`)
    }
    return options;
  };
  // Filter chart data based on selected range (Common function)
  const filterChartData = (data: Array<{ name: string; value: number }>, selectedRange: string) => {
    if (!data || data.length === 0) return []; // Handle null or empty data
    if (!selectedRange) return data
    const [min, max] = selectedRange.split('-').map(Number);
    return data.slice(min - 1, max);
  };
  const filteredChartData = filterChartData(chartData, range);
  const filteredChartData2 = filterChartData(chartData2, range2);

  // Handle category change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setUseCategory("");
    setSearchText("");
    // Clear search text when a category is selected
    setUseCategory(category)
    if (category) {
      fetchProductsByCategory(userId,category);
    } else {
      setProducts([]); // Clear products if no category is selected
    }
  };
  // Handle product selection
  const handleProductSelect = (product: { id: string; productname: string }) => {
    setSearchText(product.productname); // Update search text
    setSelectedProduct(product);
    setIsProductSelected(true);
    // Store the selected product
  };


  const filteredSuggestions = products.filter(product =>
    product.productname.toLowerCase().includes(searchText.toLowerCase())
  );

  // Limit to first 5
  const limitedSuggestions = filteredSuggestions.slice(0, 5);
  // Handle change in the search input field
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
    // Filter the products based on search text
    const filteredProducts = (allProducts as Product[]).filter((product: Product) =>
      product.productname.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Update the products to display only the filtered ones
    setProducts(filteredProducts.slice(0, 5)); // You can adjust the logic to show top 5 or all
  };
  // edir

  useEffect(() => {
    setChartData(
      products.map((prod) => ({
        name: prod.productname,
        value: prod.sellingprice ?? 0, // Use 0 or another default if sellingprice is missing
      }))
    ); // Show all products initially
  }, [products]);

  const rangeOptions = generateRangeOptions(chartData.length);
  const rangeOptions2 = generateRangeOptions(chartData2.length);
  return (
    <section className="benchmark-container">
      {/* Success/Error Message */}
      <div className={`messageContainer ${message ? 'show' : 'hide'} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>
      <div className="benchmark-right-panel">
        <div className="control-panel">
          <h3 className="panel-title">Product Selection</h3>

          <div className="button-panel">

            <div className="search-container">
              <FontAwesomeIcon icon={faFilter} className="search-icon" />

              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="product-clear-field"
                disabled={!!UseCategory}
              >
                <option value="">Select Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Category Input Field */}
            <div className="search-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />

              <input
                id="categoryInput"
                type="text"
                placeholder="Type category name..."
                value={UseCategory}
                onChange={(e) => {
                  setUseCategory(e.target.value);

                  // handleCategoryChange(e); // Optionally call handleCategoryChange if needed
                }}
                className="product-clear-field"
                disabled={!!selectedCategory}

              />

            </div>

            <div className="search-container">
            <FontAwesomeIcon icon={faPlus} className="search-icon" />

              <input
                type="text"
                placeholder="Search product..."
                value={searchText}
                onChange={handleSearchChange}
                className="product-clear-field"
                id="productSearch"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="clear-search-icon"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            <div className="search-container">
            <FontAwesomeIcon icon={faTrash} className="search-icon" />

              <button
                onClick={() => {
                  setUseCategory("");
                  setSelectedCategory("");
                  setProducts([]);
                  setSearchText("");
                }}
                className="product-clear-field red"
              >
                Clear Search
              </button>
              
            </div>

            <div className="search-container">
            <FontAwesomeIcon icon={faTruck} className="search-icon" />

              <button
                onClick={handleApplyProduct}
                className={`product-clear-field green ${selectedProduct ? 'active' : ''}`}
                disabled={!selectedProduct || isAnimating}
              >
                {isAnimating ? 'Analyzing...' : 'Analyze Product'}
              </button>
            </div>

          </div>


          {loading ? (
            <div className="loading-state">
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          ) : (

            <div className="product-suggestions">
              {(searchText || selectedCategory || UseCategory) && (
                <div className="suggestions-header">
                  <h4>
                    {searchText
                      ? `Search Results for "${searchText}"`
                      : UseCategory
                        ? `Products in ${UseCategory}`
                        : `Products in ${selectedCategory}`}
                  </h4>
                </div>
              )}
              <div className="suggestion-div">
                {limitedSuggestions.length > 0 ? (
                  limitedSuggestions.map(product => (
                    <div
                      key={product.id}
                      className={`suggestion-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <span>{product.productname}</span>
                      <FontAwesomeIcon icon={faPlus} className="add-icon" />
                    </div>
                  ))
                ) : (
                 (searchText || selectedCategory || UseCategory) && (
      <div className="not">
        <p className="no-products">No products found</p>
      </div>
    )
                )}
              </div>

            </div>
          )}

          {error && <p className="error-message">{error}</p>}


        </div>
      </div>
      <div className="benchmark-left-panel">
        {!applyClicked ? (
          <div className="welcome-state">
            <div className="welcome-animation">
              <div className="animation-circle"></div>
              <div className="animation-circle delay-1"></div>
              <div className="animation-circle delay-2"></div>
            </div>
            <h2 className="welcome-title">Product Benchmarking</h2>
            <p className="welcome-text">
              Select a product to compare performance metrics, pricing, and stock levels against similar products
            </p>
            <div className="welcome-features">
              <div className="feature-card">
                <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
                <span>Price Comparison</span>
              </div>
              <div className="feature-card">
                <FontAwesomeIcon icon={faBoxOpen} className="feature-icon" />
                <span>Stock Analysis</span>
              </div>
              <div className="feature-card">
                <FontAwesomeIcon icon={faTruck} className="feature-icon" />
                <span>Vendor Insights</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="target-product-banner">
              <div className="target-product-content">
                <h3>Analyzing Product:</h3>
                <div className="target-product-name">
                  <span>{targetProductDetails?.productname || selectedProduct?.productname}</span>
                  <span className="target-product-category">{selectedCategory}</span>
                </div>
              </div>
            </div>
            <div className={`chart-container big ${isAnimating ? 'fade-in' : ''}`}>
              <div className="chart-header">
                <h3>Selling Price Comparison</h3>
                <select className="range-select" value={range} onChange={handleRangeChange}>
                  {rangeOptions.map((option) => (
                    <option key={option} value={option}>Products {option}</option>
                  ))}
                </select>
              </div>
              <div className="chart-content">
                {filteredChartData.length > 0 ? (
                  <ComparisonChart data={filteredChartData} />
                ) : (
                  <p className="no-data">No comparison data available</p>
                )}
              </div>
            </div>

            <div className={`chart-container big ${isAnimating ? 'fade-in' : ''}`}>
              <div className="chart-header">
                <h3>Profit Margin Comparison  </h3>
                <select className="range-select" value={range2} onChange={handleRangeChange2}>
                  {rangeOptions2.map((option) => (
                    <option key={option} value={option}>Products {option}</option>
                  ))}
                </select>
              </div>
              <div className="chart-content">
                {filteredChartData2.length > 0 ? (
                  <ProfitMarginChart
                    data={filteredChartData2}
                    targetProduct={targetProductDetails?.productname || selectedProduct?.productname || ""}
                  />
                ) : (
                  <p className="no-data">No margin data available</p>
                )}
              </div>
            </div>

            <div className="stats-container-in">
              <div className={`stat-card2 stock ${isAnimating ? 'fade-in' : ''}`}>
                <h4>Stock Levels</h4>
                <div className="stat-value-2">{targetProductDetails?.stockquantity || 'N/A'}</div>
                <p className="stat-label-2">Current Stock</p>
                <div className="stat-threshold-2">
                  <span>Reorder at: {targetProductDetails?.reorderthreshold || 'N/A'}</span>
                </div>
              </div>
              <div className={`stat-card2 stock ${isAnimating ? 'fade-in' : ''}`}>
                <h4>Product Weight/Size</h4>
                <div className="stat-value-2">{targetProductDetails?.productSize || 'N/A'}</div>
                <p className="stat-label-2">Current Product Weight</p>
                <div className="stat-threshold-2">
                  {/* <span>Reorder at: {targetProductDetails?.reorderthreshold || 'N/A'}</span> */}
                </div>
              </div>
              <div className={`stat-card2 vendor ${isAnimating ? 'fade-in' : ''}`}>
                <h4>Vendor Details</h4>
                <div className="vendor-name">{targetProductDetails?.vendor || 'N/A'}</div>
                <div className="vendor-stats-2">
                  <div className="vendor-stat-2">
                    <span className="stat-value-2">{targetProductDetails?.ReliabilityScore || 'N/A'}</span>
                    <span className="stat-label-2">Reliability</span>
                  </div>
                  <div className="vendor-stat-2">
                    <span className="stat-value-2">{targetProductDetails?.DeliveryTime || 'N/A'}</span>
                    <span className="stat-label-2">Delivery Days</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>


    </section>
  );
}
