
import Button from "@/components/Button";

import '@/styles/buttonFrame.css';
import { fetchCategories, fetchAvailableMonths } from "@/utils/api";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faFilter, faCalendarAlt, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';

type ButtonFrame4Props = {
  onProductSelect: (product: string) => void;
  onCategorySelect: (category: string) => void;
  onPredict: (product: string, category: string, month: string | null, granularity: string) => void;
  selectedProduct: string;
  selectedCategory: string;
  onMonthSelect: (month: string) => void;
  onGranularitySelect: (granularity: string) => void;
};

const ButtonFrame4 = ({
  onProductSelect,
  onCategorySelect,
  onPredict,
  selectedProduct,
  selectedCategory,
  onMonthSelect,
  onGranularitySelect, // Add this prop
}: ButtonFrame4Props) => {
  const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [selectedGranularity, setSelectedGranularity] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [productInput, setProductInput] = useState(selectedProduct || "");
  const [categories, setCategories] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;




  // Fetch categories using SWR
  const { data: categoryData } = useSWR(
    userId ? ["get-categories", userId] : null,
    () => fetchCategories(userId),
    { revalidateOnFocus: false }
  );

  // Fetch last recorded sales month using SWR
  const { data: lastSalesData} = useSWR(
    userId ? ["last-sales-month", userId] : null,
    () => fetchAvailableMonths(userId),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories || []);
    }
    if (lastSalesData) {
      // const lastMonth = lastSalesData.last_month; // Format: "March 2025"
      const months = lastSalesData.available_months || [];
      setAvailableMonths(months);

      // Set default selected month to the first month in the list
      setSelectedMonth(months[0]);
    }
  }, [categoryData, lastSalesData]);

  const handleGranularityChange = (granularity: string) => {
    setSelectedGranularity(granularity);
    onGranularitySelect(granularity); // Call the prop to update parent
  };
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    onMonthSelect(month); // Call the prop to update parent
    setMonthDropdownOpen(false);
  };

  console.log("selectedMonth", selectedMonth)
  console.log("selectedCategory", selectedCategory)
  console.log("productInput", productInput)
  console.log("selectedGranularity in button frmae", selectedGranularity)
  return (
    <div className="buttonContainer">
      {/* Category Dropdown */}
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
            setProductInput(e.target.value);
            onProductSelect(e.target.value);
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
      <Button
        text="Predict Demand"
        icon={faArrowAltCircleRight}
        onClick={() => onPredict(productInput, selectedCategory, selectedMonth, selectedGranularity)}
        disabled={!productInput || !selectedCategory || !selectedMonth}
      />
    </div>
  );
};

export default ButtonFrame4;