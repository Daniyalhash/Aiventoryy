import { useState, useEffect } from "react";
import useSWR from 'swr';
import { fetchCategories } from "@/utils/api";
import "@/styles/form.css";

// interface Vendor {
//   vendor_id: string;
//   vendor: string;
// }

// interface FormFields {
//   userId: string | null;
//   productname_id: string;
//   productName: string;
//   category: string;
//   subcategory: string;
//   stockquantity: string;
//   reorderthreshold: string;
//   costprice: string;
//   sellingprice: string;
//   timespan: string;
//   expirydate: string;
//   monthly_sales: string;
//   Barcode: string;
//   vendor_id: string;
//   productSize: string;
//   sale_date: string;
//   season: string;
//   last_updated: string;
// }
type AddInvoiceProps = {
  onSuccess: () => void;
};

const AddFormP: React.FC<AddInvoiceProps> = ({ onSuccess }) => {


  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [categories, setCategories] = useState([]);
  const [isError, setIsError] = useState(false);
  interface Vendor {
    vendor_id: string;
    vendor: string;
  }
  const [vendors, setVendors] = useState<Vendor[]>([]);
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

  const fetchVendorsByCategory = async (userId: string, category: string) => {
    const response = await fetch(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/vendors-by-category/?userId=${userId}&category=${category}`);
    if (!response.ok) throw new Error("Failed to fetch vendors");
    return await response.json();
  };




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
    userId: userId,
    productname_id: generateSampleId(),
    productName: "",
    category: "",
    subcategory: "",
    stockquantity: "",
    reorderthreshold: "",
    costprice: "",
    sellingprice: "",
    timespan: "",
    expirydate: "",
    monthly_sales: "",
    Barcode: "",
    vendor_id: "",
    productSize: "",
    sale_date: "",
    season: "",
    last_updated: generateCurrentDateTime(),
  });

  // Inside your component
  // const [selectedVendorId, setSelectedVendorId] = useState("");


  useEffect(() => {
    const loadVendors = async () => {
      if (!formFields.category || !userId) return;

      try {
        const data = await fetchVendorsByCategory(userId, formFields.category);
        setVendors(data.vendors || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setMessage("Error fetching vendors")
        setIsError(true)
      } 
    };

    loadVendors();
  }, [formFields.category, userId]);









  const [message, setMessage] = useState<string | null>(null);
  // const [error, setError] = useState(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("https://seal-app-8m3g5.ondigitalocean.app/aiventory/add-product/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formFields),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result);
        setMessage("✅ Product added successfully!");
        setFormFields({
          userId: userId,
          productname_id: generateSampleId(),
          productName: "",
          category: "",
          subcategory: "",
          stockquantity: "",
          reorderthreshold: "",
          costprice: "",
          sellingprice: "",
          timespan: "",
          expirydate: "",
          monthly_sales: "",
          Barcode: "",
          vendor_id: "",
          productSize: "",
          sale_date: "",
          season: "",
          last_updated: generateCurrentDateTime(),
        });

                   // Delay a bit to show message, then close & refresh
        setTimeout(() => {
          onSuccess(); // Close modal and refresh page
        }, 1000);
      } else {
        console.error("Error:", result);
        setMessage("❌ Failed to add vendor.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Network error. Check backend connection.");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="simple-form2">
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
          <div className="section-title">Basic Information</div>

          <div className="form-group">
            <label>Product ID</label>
            <input type="text" value={formFields.productname_id} disabled />
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="productName"
              value={formFields.productName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formFields.category}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sub Category</label>
            <input
              type="text"
              name="subcategory"
              value={formFields.subcategory}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Inventory Details Section */}
        <div className="form-section">
          <div className="section-title">Inventory Details</div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              name="stockquantity"
              value={formFields.stockquantity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Reorder Threshold</label>
            <input
              type="number"
              name="reorderthreshold"
              value={formFields.reorderthreshold}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Product Size</label>
            <input
              type="text"
              name="productSize"
              value={formFields.productSize}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Barcode</label>
            <input
              type="number"
              name="Barcode"
              value={formFields.Barcode}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="form-section">
          <div className="section-title">Pricing</div>

          <div className="form-group">
            <label>Cost Price</label>
            <input
              type="number"
              name="costprice"
              value={formFields.costprice}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Selling Price</label>
            <input
              type="number"
              name="sellingprice"
              value={formFields.sellingprice}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Monthly Sales *</label>
            <input
              type="number"
              name="monthly_sales"
              value={formFields.monthly_sales}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Dates & Vendor Section */}
        <div className="form-section">
          <div className="section-title">Dates & Vendor</div>

          <div className="form-group">
            <label>Timespan Date</label>
            <input
              type="date"
              name="timespan"
              value={formFields.timespan}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expirydate"
              value={formFields.expirydate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Sale Date</label>
            <input
              type="date"
              name="sale_date"
              value={formFields.sale_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Select Vendor *</label>
            <select
              name="vendor_id"
              value={formFields.vendor_id}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.vendor_id} value={vendor.vendor_id}>
                  {vendor.vendor} 
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="form-section">
          <div className="section-title">Additional Information</div>

          <div className="form-group">
            <label>Season (Spring, Summer, etc.)</label>
            <input
              type="text"
              name="season"
              value={formFields.season}
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
        <button type="submit">Add Product</button>
      </div>
    </form>
  );
};

export default AddFormP;