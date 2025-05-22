



"use client";
import { useState } from 'react';
import FutureOver from '@/components/FutureOver';
import Cards4 from '@/components/Cards4';
import Cards3 from '@/components/Cards3';
import "@/styles/futurePage.css";
import ButtonFrame3 from '@/components/ButtonFrame3';
import axios from 'axios';
import { AxiosError } from 'axios';  // Add this import at the top
// interface Product {
//   id: string;
//   name: string;
//   // add other product properties as needed
// }

export default function Future() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [predictedValue, setPredictedValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [sellingPrice, setsellingPrice] = useState(null);
  const [last_month_sales, setlast_month_sales] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedGranularity, setSelectedGranularity] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState("daily");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [hasPrediction, setHasPrediction] = useState(false); // Add this new state




  const handlePredict = async (product: string, category: string, selectedMonth: string) => {
    console.log("Values are going in ", category)
    console.log("Values are going in ", categories)

    if (!product) {
      setMessage("Please select a product");
      setIsError(true);
      return;
    }
    if (!category) {
      setMessage("Please select a category");
      setIsError(true);
      return;
    }
    if (!selectedMonth) {
      setMessage("Please select a month");
      setIsError(true);
      return;
    }
    const [monthName] = selectedMonth.split(" ");
    setIsLoading(true);
    setMessage("");
    setIsError(false);
    // setIsLoading(true);
    // setPredictionError(null);
    console.log("category going", sellingPrice)
    console.log("selectedMonth", selectedMonth)
    try {
      setMessage("Generating prediction...");
      setIsError(false);

      const response = await axios.post('http://127.0.0.1:8000/aiventory/predict-sales/', {
        user_id: userId,
        productname: product,
        category: category,
        selectedMonth: monthName,
        prev_month_sales: last_month_sales || 0,
        prev_2_month_sales: 0, // Example: Populate with actual data
        prev_3_month_sales: 0,
        rolling_avg_3m: 0,
        rolling_avg_6m: 0,
        sales_diff_1m: 0
      });
      setCategories([category]);

      // Set seasonal data from response
      setlast_month_sales(response.data.last_month_sales)
      setHistoricalData(response.data.historical_data)
      setsellingPrice(response.data.selling_price)
      setPredictedValue(response.data.prediction);
      setHasPrediction(true); // Set this to true after successful prediction
      setMessage("Prediction generated successfully!");
      setIsError(false);
    } catch (error) {
      const axiosError = error as AxiosError;
      // Safely extract error message from response data
      const errorMsg =
        typeof axiosError.response?.data === "object" && axiosError.response?.data !== null && "message" in axiosError.response.data
          ? (axiosError.response.data as { message?: string }).message || "Prediction failed"
          : "Prediction failed";
      setMessage(errorMsg);

      setIsError(true);
      console.error("Prediction error:", error);
    } finally {
      setIsLoading(false);  // <-- Set loading to false when done
    }
  };

  return (
    <div className="futurePage">
      <div className={`messageContainer ${message ? 'show' : 'hide'} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>



      <FutureOver />

     <ButtonFrame3
        onProductSelect={(product: string) => setSelectedProduct(product)}
        onCategorySelect={(category: string) => setSelectedCategory(category)}
        onMonthSelect={(selectedMonth: string) => setSelectedMonth(selectedMonth)}
        onGranularitySelect={(selectedGranularity: string) => setSelectedGranularity(selectedGranularity)}
        onPredict={handlePredict}
        selectedProduct={selectedProduct}
        selectedCategory={selectedCategory}
      />
      {/* Loading Spinner (shown when isLoading is true) */}
      {isLoading && (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      )}
      {hasPrediction && !isLoading ? (
        <>
          <div className="futureSub">
            <Cards4
              predictedValue={predictedValue}
              isLoading={isLoading}
              sellingPirce={sellingPrice}
              last_month_sales={last_month_sales}
              predictionError={predictionError}
              selectedProduct={selectedProduct}
              selectedCategory={selectedCategory}
              selectedMonth={selectedMonth}
              historicalData={historicalData}
            />
          </div>
          <Cards3
            predictedValue={predictedValue}
            isLoading={isLoading}
            sellingPirce={sellingPrice}
            last_month_sales={last_month_sales}
            predictionError={predictionError}
            selectedProduct={selectedProduct}
            selectedCategory={selectedCategory}
            historicalData={historicalData}
            selectedMonth={selectedMonth}
            selectedGranularity={selectedGranularity}
          />
        </>
      ) : (
        !isLoading && <PlaceholderContent />
      )}
    </div>
  );
}

const PlaceholderContent = () => (
  <div className="prediction-placeholder">
    <div className="placeholder-content">
      <h2>Sales Prediction Dashboard</h2>
      <p>Get accurate sales forecasts by selecting your product, category, and time period.</p>
      <div className="placeholder-steps">
        <div className="step">
          <div className="step-icon">1</div>
          <p>Select a product and category</p>
        </div>
        <div className="step">
          <div className="step-icon">2</div>
          <p>Choose a month and day</p>
        </div>
        <div className="step">
          <div className="step-icon">3</div>
          <p>Click &quot;Predict&quot; to see your forecast</p>
        </div>
      </div>
      <div className="sample-visualization">
        <svg width="100%" height="240" viewBox="0 0 500 240" className="sample-chart">
          {/* X-axis */}
          <line x1="50" y1="200" x2="450" y2="200" stroke="#17412D" strokeWidth="2" />
          {/* Y-axis */}
          <line x1="50" y1="200" x2="50" y2="50" stroke="#17412D" strokeWidth="2" />

          {/* Grid lines */}
          <line x1="50" y1="170" x2="450" y2="170" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="50" y1="140" x2="450" y2="140" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="50" y1="110" x2="450" y2="110" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="50" y1="80" x2="450" y2="80" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />

          {/* Axis labels */}
          <text x="30" y="80" fill="#555" fontSize="12" textAnchor="end">400</text>
          <text x="30" y="110" fill="#555" fontSize="12" textAnchor="end">300</text>
          <text x="30" y="140" fill="#555" fontSize="12" textAnchor="end">200</text>
          <text x="30" y="170" fill="#555" fontSize="12" textAnchor="end">100</text>
          <text x="30" y="200" fill="#555" fontSize="12" textAnchor="end">0</text>

          <text x="125" y="220" fill="#555" fontSize="12" textAnchor="middle">Jan</text>
          <text x="200" y="220" fill="#555" fontSize="12" textAnchor="middle">Feb</text>
          <text x="275" y="220" fill="#555" fontSize="12" textAnchor="middle">Mar</text>
          <text x="350" y="220" fill="#555" fontSize="12" textAnchor="middle">Apr</text>
          <text x="425" y="220" fill="#555" fontSize="12" textAnchor="middle">May</text>

          {/* Chart title */}
          <text x="250" y="30" fill="#17412D" fontSize="16" fontWeight="bold" textAnchor="middle">Sample Sales Prediction</text>

          {/* Historical data line */}
          <polyline
            points="125,170 200,140 275,110 350,80"
            fill="none"
            stroke="#9FE870"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Predicted data line (dashed) */}
          <polyline
            points="350,80 425,50"
            fill="none"
            stroke="#17412D"
            strokeWidth="3"
            strokeDasharray="8,4"
            strokeLinejoin="round"
          />

          {/* Data points */}
          <circle cx="125" cy="170" r="5" fill="#9FE870" />
          <circle cx="200" cy="140" r="5" fill="#9FE870" />
          <circle cx="275" cy="110" r="5" fill="#9FE870" />
          <circle cx="350" cy="80" r="5" fill="#9FE870" />
          <circle cx="425" cy="50" r="5" fill="#17412D" />

          {/* Legend */}
          <rect x="350" y="30" width="15" height="3" fill="#9FE870" />
          <text x="370" y="33" fill="#555" fontSize="12">Historical</text>
          <rect x="350" y="45" width="15" height="3" fill="#17412D" />
          <text x="370" y="48" fill="#555" fontSize="12">Predicted</text>

          {/* Prediction highlight */}
          <rect x="410" y="40" width="30" height="20" rx="2" fill="#17412D" fillOpacity="0.1" />
          <text x="425" y="55" fill="#17412D" fontSize="12" textAnchor="middle">+32%</text>
        </svg>
      </div>
    </div>
  </div>
)






