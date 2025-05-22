import { useState, useEffect } from "react";
import useSWR from 'swr';
import { fetchCategories } from "@/utils/api";
import "@/styles/form.css";

const SimpleForm = () => {


  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [categories, setCategories] = useState([]);
  const [isError, setIsError] = useState(false);
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
  const generateSampleId = () => {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    const random = "xxxxxxxxxxxxxxxx".replace(/[x]/g, () =>
      ((Math.random() * 16) | 0).toString(16)
    );
    return timestamp + random;
  };

  const generateCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace("T", " ") + ".000000";
  };

  // Simulated categories (you can replace this with real fetched data later)
  console.log("user id ", userId)
  const [formFields, setFormFields] = useState({
    vendor_id: generateSampleId(),
    userId: userId,
    vendor: "",

    category: "",
    vendorPhone: "",
    DeliveryTime: "",
    ReliabilityScore: "",
    last_updated: generateCurrentDateTime(),
  });
  const [message, setMessage] = useState<string | null>(null);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/aiventory/add-vendor/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formFields),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Success:", result);
        setMessage("✅ Vendor added successfully!");
        setIsError(false)
        // Reset form after successful submission
        setFormFields({
          vendor_id: generateSampleId(),
          userId: userId,
          vendor: "",
          category: "",
          vendorPhone: "",
          DeliveryTime: "",
          ReliabilityScore: "",
          last_updated: generateCurrentDateTime(),
        });
      } else {
        console.error("Error:", result);
        setMessage("❌ Failed to add vendor.");
        setIsError(true)

      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Network error. Check backend connection.");
      setIsError(true)
    }
  };
  return (
    <form onSubmit={handleSubmit} className="simple-form">
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
            <label>Vendor ID</label>
            <input type="text" value={formFields.vendor_id} disabled />
          </div>

          <div className="form-group">
            <label>Vendor Name *</label>
            <input
              type="text"
              name="vendor"
              value={formFields.vendor}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formFields.category}
              onChange={handleInputChange}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>
        <div className="form-section">
        <div className="form-group">
        <label>Phone Number *</label>
        <input
          type="text"
          name="vendorPhone"
          value={formFields.vendorPhone}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Delivery Time (days)</label>
        <input
          type="number"
          step="0.1"
          name="DeliveryTime"
          value={formFields.DeliveryTime}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Reliability Score (%) *</label>
        <input
          type="number"
          min="0"
          max="100"
          name="ReliabilityScore"
          value={formFields.ReliabilityScore}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Last Updated</label>
        <input type="text" value={formFields.last_updated} disabled />
      </div>
        </div>
      </div>


      
      <div className="form-actions">

      <button type="submit">Submit Vendor</button>
      </div>

    </form>
  );
};

export default SimpleForm;