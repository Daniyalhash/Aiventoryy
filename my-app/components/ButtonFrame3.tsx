
import Button from "@/components/Button";
import axios from 'axios';

import '@/styles/buttonFrame.css';
import { fetchCategories, fetchAvailableMonths } from "@/utils/api";
import { fetchProductsByCategory } from "@/utils/api";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPlus,faBoxOpen, faFilter, faCalendarAlt, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';

const ButtonFrame3 = ({
  onProductSelect,
  onCategorySelect,
  onPredict,
  selectedCategory,
  onMonthSelect,
  onGranularitySelect, // Add this prop
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [selectedGranularity, setSelectedGranularity] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [productInput, setProductInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isProductSelected, setIsProductSelected] = useState(false); // Add state for product selection
  const [selectedProduct, setSelectedProduct] = useState(null); // Added this line


  const [predictionResult, setPredictionResult] = useState(null); // Track prediction result
  const [isPredicting, setIsPredicting] = useState(false); // Track prediction status
  const [loading, setLoading] = useState(false); // Track loading state



  // Fetch categories using SWR
  const { data: categoryData, error: categoryError } = useSWR(
    userId ? ["get-categories", userId] : null,
    () => fetchCategories(userId),
    { revalidateOnFocus: false }
  );

  // Fetch last recorded sales month using SWR
  const { data: lastSalesData, error: lastSalesError } = useSWR(
    userId ? ["last-sales-month", userId] : null,
    () => fetchAvailableMonths(userId),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories || []);
    }
    if (lastSalesData) {
      const lastMonth = lastSalesData.last_month; // Format: "March 2025"
      const months = lastSalesData.available_months || [];
      setAvailableMonths(months);

      // Set default selected month to the first month in the list
      setSelectedMonth(months[0]);
    }
  }, [categoryData, lastSalesData]);


  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading
  } = useSWR(
    selectedCategory ? ["get-top-products-by-category", userId, selectedCategory] : null,
    async ([_, userId, category]) => {
      const response = await axios.get(
        'http://127.0.0.1:8000/aiventory/get-top-products-by-category/',
        { params: { user_id: userId, category } }
      );
      return response.data.products || [];


    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30s
    }
  );
  // Update suggested products when data changes
  useEffect(() => {
    if (productsData) {
      setSuggestedProducts(productsData);
    }
  }, [productsData]);

  // Filtered based on productInput
  const filteredSuggestions = suggestedProducts.filter(product =>
    product.productname.toLowerCase().includes(productInput.toLowerCase())
  );

  // Limit to first 5
  const limitedSuggestions = filteredSuggestions.slice(0, 5);

  const handleGranularityChange = (granularity) => {
    setSelectedGranularity(granularity);
    onGranularitySelect(granularity); // Call the prop to update parent
  };
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    onMonthSelect(month); // Call the prop to update parent
    setMonthDropdownOpen(false);
  };
  // Handle prediction request
  const handlePredict = async () => {
    if (!productInput || !selectedCategory || !selectedMonth) return;

    // Clear previous prediction result
    setPredictionResult(null);

    // Disable the button and show loading state
    setIsPredicting(true);

    try {
      // Simulate prediction logic (replace with actual API call)
      const result = await onPredict(productInput, selectedCategory, selectedMonth, selectedGranularity);

      // Store the prediction result
      setPredictionResult(result);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      // Re-enable the button after prediction
      setIsPredicting(false);
    }
  };
  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setProductInput(""); // Reset product input when category changes
    setIsProductSelected(false);
    onCategorySelect(category);
    setCategoryDropdownOpen(false);
  };
  // Handle product selection
  const handleProductSelect = (product) => {
    setProductInput(product.productname); // Show name in input
    onProductSelect(product.productname); // Inform parent
    setSelectedProduct(product);
    setIsProductSelected(true);
  };

  console.log("selectedMonth", selectedMonth)
  console.log("selectedCategory", selectedCategory)
  console.log("productInput", productInput)
  console.log("selectedGranularity in button frmae", selectedGranularity)
  return (
    <div className="buttonContainer">
      {/* Category Dropdown */}
      <div className="buttonUpper">
        <div className="dropdown-wrapper">
          
          <Button
            text={
              <div className="dropdown-button-content">
                {selectedCategory || "Select Category"}
                <FontAwesomeIcon icon={faChevronDown} className="dropdown-chevron" />
              </div>
            }
            icon={faFilter}
            onClick={() => setCategoryDropdownOpen(!isCategoryDropdownOpen)}
            isDropdown={true}
          />
          {isCategoryDropdownOpen && (
            <div className="dropdown-menu category-dropdown">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category}
                    className={`dropdown-item ${selectedCategory === category ? 'selected' : ''}`}
                    onClick={() => {
                      onCategorySelect(category);
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    {category}
                  </div>
                ))
              ) : (
                <div className="dropdown-item empty">No categories found</div>
              )}
            </div>
          )}
        </div>

        {/* Product Input Field */}
        <div className="product-input-wrapper">
          <input
            type="text"
            value={productInput}
            onChange={(e) => {
              const value = e.target.value;
              setProductInput(value);
              setIsProductSelected(false); // Reset
              onProductSelect(value);



              if (productsData) {
                const filtered = productsData
                  .filter(product =>
                    product.productname.toLowerCase().includes(value.toLowerCase())
                  )
                  .slice(0, 5); // Limit to 5 suggestions

                setSuggestedProducts(filtered);
              }
            }}

            placeholder="Enter product name"
            className="product-input-field"
          />
          
        </div>
        {/* Granularity Selection (Radio Buttons) */}
        <div className="granularity-container">
          <div className="granularity-selector">
            <input
              type="radio"
              id="month-option"
              name="granularity"
              value="month"
              checked={selectedGranularity === "month"}
              onChange={() => handleGranularityChange("month")}
            />
            <label htmlFor="month-option" className="option-label">
              <span>Monthly</span>
            </label>

            <input
              type="radio"
              id="day-option"
              name="granularity"
              value="day"
              checked={selectedGranularity === "day"}
              onChange={() => handleGranularityChange("day")}
            />
            <label htmlFor="day-option" className="option-label">
              <span>Day</span>
            </label>

            <span className="selection-indicator"></span>
          </div>
        </div>

        {/* Month Selection Dropdown */}
        <div className="dropdown-wrapper">
          <Button
            text={
              <div className="dropdown-button-content">
                {selectedMonth || "Select Month"}
                <FontAwesomeIcon icon={faChevronDown} className="dropdown-chevron" />
              </div>
            }
            icon={faCalendarAlt}
            onClick={() => setMonthDropdownOpen(!isMonthDropdownOpen)}
            isDropdown={true}
          />
          {isMonthDropdownOpen && (
            <div className="dropdown-menu month-dropdown">
              {availableMonths.length > 0 ? (
                availableMonths.map((month) => (
                  <div
                    key={month}
                    className={`dropdown-item ${selectedMonth === month ? 'selected' : ''}`}
                    onClick={() => handleMonthSelect(month)}
                  >
                    {month}
                  </div>
                ))
              ) : (
                <div className="dropdown-item empty">No months available</div>
              )}
            </div>
          )}
        </div>

        {/* Predict Button */}
        {/* Predict Button */}
        <Button
          text="Predict Demand"
          icon={faArrowAltCircleRight}
          onClick={handlePredict}
          disabled={!productInput || !selectedCategory || !selectedMonth || isPredicting}
          isPrimary={true}
        />
      </div>
      <div className="buttonDowner">
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
            {(productInput || selectedCategory) && (
              <div className="suggestions-header">
                <h4>
                  {productInput
                    ? `Search Results for "${productInput}"`
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
               <div className="empty-state">
        <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
        <p className="empty-message">
          {productInput 
            ? `No products found for "${productInput}"`
            : `Product Suggestions will show here`}
        </p>
      </div>
              )}

            </div>


          </div>
        )}



      </div>

    </div>
  );
};

export default ButtonFrame3;























