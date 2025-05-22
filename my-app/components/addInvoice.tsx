import { useState, useEffect } from "react";
import useSWR from 'swr';
import { fetchCategories } from "@/utils/api";
import "@/styles/addInvoice.css";
interface Product {
  product_id: string;
  name: string;
  category: string;
  stockquantity: number;
  price: number;
}

// interface FormData {
//   vendor_id: string;
//   vendor: string;
//   vendorPhone: string;
//   date: string;
//   products: Product[];
// }
const AddInvoice = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [loadingVendors, setLoadingVendors] = useState(false);
  // const [loadingProducts, setLoadingProducts] = useState(false);

  const [vendors, setVendors] = useState([]);

 
  const { data: categoryData} = useSWR(
    userId ? ["get-categories", userId] : null,
    () => fetchCategories(userId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
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

  const fetchVendorsByCategory = async (userId, category) => {
    try {
      console.log("Fetching vendors for:", { userId, category }); // Debug input

      const response = await fetch(`http://localhost:8000/aiventory/vendors-by-category/?userId=${userId}&category=${category}`);
      console.log("Raw response:", response); // Debug raw response

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response data:", errorData);
        throw new Error(errorData.message || "Failed to fetch vendors");
      }

      const data = await response.json();
      console.log("Vendors data:", data); // Debug parsed data
      return data;
    } catch (error) {
      console.error("Error in fetchVendorsByCategory:", error);
      throw error;
    }
  };

  const fetchProductsByCategory = async (userId, category) => {
    const response = await fetch(
      `http://localhost:8000/aiventory/products-by-category/?userId=${userId}&category=${category}`
    );
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  };



  // Form state
  const [formData, setFormData] = useState({
    vendor_id: "",
    vendor: "",
    vendorPhone: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    products: [{
      product_id: "",
      name: "",
      category: "",
      stockquantity: 1,
      price: 0
    }]
  });

  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedCategory || !userId) return;

      // setLoadingProducts(true);
      try {
        const data = await fetchProductsByCategory(userId, selectedCategory);
// Logging with sample rows
      console.log(`✅ Loaded ${data.products?.length || 0} products`);
      console.log('Sample products (first 5):', 
        data.products?.slice(0, 5).map(p => ({
          name: p.productname,
          category: p.category,
          price: p.costprice,
          stockquantity:p.stockquantity,
          barcode: p.barcode
        }))
      );        setProducts(data.products || []);
      } catch (err) {
        console.error("Error loading products:", err);
        setProducts([]);
      } finally {
        // setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [selectedCategory, userId]);
const selectedProductCategory = formData.products[0]?.category;

  useEffect(() => {
    const loadVendors = async () => {
      if (!formData.products[0]?.category || !userId) {
        console.log("Skipping vendor fetch - missing category or userId");
        return;
      }
      console.log("Starting vendor fetch for category:", formData.products[0]?.category);
      setLoadingVendors(true);
      try {
        const data = await fetchVendorsByCategory(userId, selectedProductCategory);
        console.log("Fetched vendors:", data.vendors);

        if (!data.vendors || !Array.isArray(data.vendors)) {
          console.warn("Unexpected vendors format:", data);
          setVendors([]);
        } else {
          setVendors(data.vendors || []);
        }
      } catch (err) {
        console.error("Error in loadVendors:", err);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    loadVendors();
  }, [selectedProductCategory, userId]);




  // Add this handler for vendor selection
  const handleVendorSelect = (vendorId) => {
    const selectedVendor = vendors.find(v => v.vendor_id === vendorId);
    if (selectedVendor) {
      setFormData(prev => ({
        ...prev,
        vendor_id: selectedVendor.vendor_id,
        vendor: selectedVendor.vendor,
        vendorPhone: selectedVendor.vendorPhone || ""
      }));
    }
  };




  // Add this handler for product selection
  const handleProductSelect = (index, productName) => {
    const selectedProduct = products.find(p => p.productname === productName);
    if (selectedProduct) {
      const updatedProducts = [...formData.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        name: selectedProduct.productname,
        product_id: selectedProduct.product_id,
        price: selectedProduct.costprice || selectedProduct.sellingprice || 0,
        stockquantity: selectedProduct.stockquantity, // Add this line

        // You can auto-fill other fields as needed
        category: selectedProduct.category
      };

      setFormData(prev => ({
        ...prev,
        products: updatedProducts
      }));
    }
  };
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: name === 'stockquantity' || name === 'price' ? Number(value) : value
    };

    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    // Update category for all products
    const updatedProducts = formData.products.map(product => ({
      ...product,
      category
    }));
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const addProductField = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product_id: "",
          name: "",
          category: selectedCategory || "",
          stockquantity: 1,
          price: 0
        }
      ]
    }));
  };

  const removeProductField = (index) => {
    if (formData.products.length > 1) {
      const updatedProducts = [...formData.products];
      updatedProducts.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        products: updatedProducts
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", isError: false });

    try {
      // Validate form
      if (!formData.vendor_id || !formData.vendor || formData.products.some(p => !p.name || p.quantity <= 0)) {
        throw new Error("Please fill all required fields with valid values");
      }

      const payload = {
        ...formData,
        user_id: userId,
        // Ensure all products have the same structure
        products: formData.products.map(p => ({
          name: p.name,
          category: p.category,
          quantity: p.stockquantity,
          price: p.price,
          product_id: p.product_id || undefined // Only include if exists
        }))
      };
      console.log("payload",payload)
      const response = await fetch("http://localhost:8000/aiventory/save-invoice/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: "✅ Invoice created successfully!", isError: false });
        // Reset form
        setFormData({
          vendor_id: "",
          vendor: "",
          vendorPhone: "",
          date: new Date().toISOString().split("T")[0],
          products: [{
            product_id: "",
            name: "",
            category: selectedCategory || "",
            quantity: 1,
            price: 0
          }]
        });
      } else {
        throw new Error(result.message || "Failed to create invoice");
      }
    } catch (error) {
      setMessage({ text: `❌ ${error.message}`, isError: true });
      console.error("Invoice creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} >
      {message.text && (
        <div className={`message ${message.isError ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}


      <div className="form-grid">
        <div className="form-section">
          <div className="form-group">
            <label>Category *</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
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
            <label>Select Vendor *</label>
            <select
              value={formData.vendor_id}
              onChange={(e) => handleVendorSelect(e.target.value)}
              disabled={!selectedCategory || loadingVendors}
              required
            >
              <option value="">-- {loadingVendors ? "Loading..." : "Select Vendor"} --</option>
              {vendors.map((vendor) => (
                <option key={vendor.vendor_id} value={vendor.vendor_id}>
                  {vendor.vendor} ({vendor.vendor_id})
                </option>
              ))}
            </select>
          </div>


        </div>

        <div className="form-section">

          <div className="form-group">
            <label>Vendor Name</label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              readOnly
              className="read-only-input"
            />
          </div>

          <div className="form-group">
            <label>Vendor Phone</label>
            <input
              type="text"
              name="vendorPhone"
              value={formData.vendorPhone}
              readOnly
              className="read-only-input"
            />
          </div>

        </div>
      </div>
      <div className="products-section">
        <h3>Products</h3>
        <div className="products-container">
          {formData.products.map((product, index) => (
            <div key={index} className="product-row">
              <div className="form-group">
                <label>Product Name *</label>
                <select
                  name="name"
                  value={product.name}
                  onChange={(e) => {
                    handleProductChange(index, e); // Keep existing change handler if needed
                    handleProductSelect(index, e.target.value); // Add auto-fill handler
                  }}
                  required
                >
                  <option value="">-- Select Product --</option>
                  {products.map((prod) => (
                    <option key={prod.product_id} value={prod.productname}>
                      {prod.productname} (${prod.costprice || prod.sellingprice || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="stockquantity"
                  min="0"
                  step="0.01"
                      value={product.stockquantity || 1}  // Changed from 'quantity' to 'stockquantity'

                  onChange={(e) => handleProductChange(index, e)}
                  readOnly={true} // Make read-only if prices should come from product data
                  className="read-only-input"
                />
              </div>

              <div className="form-group">
                <label>Unit Price *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, e)}
                  required
                  readOnly={true} // Make read-only if prices should come from product data
                  className="read-only-input"
                />
              </div>
              {formData.products.length > 1 && (
                <button
                  type="button"
                  className="remove-product"
                  onClick={() => removeProductField(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>



        <button
          type="button"
          className="add-product"
          onClick={addProductField}
        >
          + Add Another Product
        </button>
      </div>



      <div className="form-actions">

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Create Invoice"}
        </button>
      </div>

    </form>
  );
};

export default AddInvoice;