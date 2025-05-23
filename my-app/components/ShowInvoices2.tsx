import '@/styles/ShowInvoice.css';
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  faPlus
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
interface Product {
  category: string;
  name: string;
  price: number;
  quantity: number;
}

interface Invoice {
  _id: string;            // MongoDB ObjectId is a string, not number
  vendor: string;
  products: Product[];
  total_amount: number;   // matches your data key for total amount
  status: string;
  formatted_date: string;
  created_at: string;     // ISO string datetime
  date: string;           // added because you have it in your data
  timezone: string;       // added because you have it
  user_id: string;        // added because you have it
  vendorPhone?: string;   // optional if you want it
  vendor_id?: string;     // optional
}
export default function ShowInvoices() {
  const searchParams = useSearchParams();

  const productname = searchParams.get("productname");
  const category = searchParams.get("category");
  const stockquantity = searchParams.get("stockquantity");
  const vendor = searchParams.get("vendor");

  
  
  
const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  const pdfRef = useRef<HTMLDivElement>(null);
  const savedInvoices = useRef(new Set());

 
  const fetchInvoices = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/aiventory/get-invoices/");
      if (!response.ok) throw new Error("Failed to fetch invoices");
  
      const data = await response.json();
  
      // Extract the invoices array from the response
      setInvoices(data.invoices || []); // Ensure it's always an array
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]); // Prevent UI crash
    }
  };
  
  useEffect(() => {
    

    if (vendor && productname && category && stockquantity) {
      const invoiceId = `${vendor}-${productname}-${category}-${stockquantity}`; // Unique ID
  
      // ✅ Prevent saving the same invoice twice
      if (savedInvoices.current.has(invoiceId)) {
        console.log("Invoice already saved, skipping...");
        return;
      }
  
  const newInvoice: Invoice = {
  _id: `${vendor.trim()}-${productname.trim()}-${category.trim()}-${Date.now()}`,
  vendor: vendor.trim(),
  products: [
    {
      name: productname.trim(),
      category: category.trim(),
      quantity: parseInt(stockquantity as string, 10) || 1,
      price: 3.79,
    }
  ],
  total_amount: 3.79 * (parseInt(stockquantity as string, 10) || 1),
  status: "pending",
  formatted_date: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }) + ` (${new Date().toLocaleDateString("en-GB")})`,
  created_at: new Date().toISOString(),
  date: new Date().toISOString().split("T")[0],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  user_id: "some-user-id",
};

  
      setInvoices((prevInvoices) => [...prevInvoices, newInvoice]);
  
      // ✅ Mark this invoice as saved
      savedInvoices.current.add(invoiceId);
      
      // ✅ Save to backend
      saveInvoice(newInvoice);
    }
    fetchInvoices();

  }, [vendor, productname, category, stockquantity, invoices.length]);
  // Function to generate PDF
  const generatePDF = async (id: string) => {
    setSelectedInvoiceId(id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    if (!pdfRef.current) return;
  
    // Temporarily show pdfRef
    pdfRef.current.style.position = "absolute";
    pdfRef.current.style.visibility = "visible";
   
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save(`Invoice_${id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  
    // Hide pdfRef again after capture
    pdfRef.current.style.position = "absolute";
    pdfRef.current.style.visibility = "hidden";
    pdfRef.current.style.zIndex = "auto";

  };

const saveInvoice = async (invoiceData: Invoice) => {
  

  try {
      const response = await fetch("http://127.0.0.1:8000/aiventory/save-invoice/", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
      });

      const data = await response.json();
      console.log("Invoice Response:", data);
  } catch (error) {
      console.error("Error saving invoice:", error);
  }
};



  console.log("pdfRef:", pdfRef.current);
  // Handle Confirm Button Click
  const handleConfirmClick = (id: string) => {
    console.log("Selected Invoice ID:", id); // Debugging
    setSelectedInvoiceId(id);
    setIsPopupOpen(true);
  };
  
  console.log("Invoices:", invoices);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedInvoiceId(null);
  };
  // const handleDeleteOrder = () => {
  //   console.log(`Order ${selectedInvoiceId} deleted.`);
  //   setInvoices(prev => prev.filter(inv => inv.id !== selectedInvoiceId));
  //   handleClosePopup();
  // };
  const handleDeleteOrder = async () => {
    if (!selectedInvoiceId) return;
    
    console.log(`Deleting invoice: ${selectedInvoiceId}`);

    try {
        const response = await fetch(`http://127.0.0.1:8000/delete-invoice/${selectedInvoiceId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Failed to delete invoice: ${response.status}`);
        }

        console.log("Invoice deleted successfully");
        setInvoices(prev => prev.filter(inv => inv._id !== selectedInvoiceId));
        // handleClosePopup();
    } catch (error) {
        console.error("Error deleting invoice:", error);
    }
};
  const handleConfirmOrder = () => {
    if (!selectedInvoiceId) return;
  
    const invoice = invoices.find(inv => inv._id === selectedInvoiceId);
    if (!invoice) return;
  
    // Format invoice details as a message
    const invoiceDetails = `📦 *Invoice Details*
  🛒 Product: ${invoice.products[0].name}
  📂 Category: ${invoice.products[0].category}
  📦 Quantity: ${invoice.products[0].quantity}
  💰 Total: $${invoice.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
  🚚 Vendor: ${invoice.vendor}
  📅 Date: ${invoice.date}`;
  
    console.log("Sending invoice via WhatsApp:", invoiceDetails);
  
  
    handleClosePopup();
  };

  return (
    <section className="invoice-section">
      <div className="invoice-container">
        <div className="invoice-header">
          <h2>Invoices</h2>
          <button className="create-invoice-button">
            <FontAwesomeIcon icon={faPlus} /> Create
          </button>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Amount</th>
              <th>PDF</th>
              <th>Action</th>

            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <React.Fragment key={invoice._id}>
                {invoice.products.map((product, index) => (
                  <tr key={`${invoice._id}-${product.name}`}>
                    {index === 0 && <td rowSpan={invoice.products.length}>{invoice._id}</td>}
                    {index === 0 && <td rowSpan={invoice.products.length}>{invoice.vendor}</td>}
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price.toFixed(2)}</td>
                    {index === 0 && (
                      <td rowSpan={invoice.products.length}>
                        ${invoice.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
                      </td>
                    )}
                    {index === 0 && (
                      <td rowSpan={invoice.products.length}>
                        <button className="view-action" onClick={() => generatePDF(invoice._id)}>View PDF</button>
                      </td>
                    )}
                    <td>
                      <button className="confirm-order-btn" onClick={() => handleConfirmClick(invoice._id)}>Confirm</button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>Confirm Action</h3>
              <p>Are you sure you want to confirm or delete this order?</p>
              <div className="popup-buttons">
                <button onClick={handleDeleteOrder} className="delete-button">Delete Order</button>
                <button onClick={handleConfirmOrder} className="confirm-button">Confirm Order</button>
                <button onClick={handleClosePopup} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}
        {/* Hidden div for PDF generation */}
        {selectedInvoiceId !== null && (
          <div ref={pdfRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
            <div className="invoice-pdf">
              <h2>Aiventory Invoice</h2>
              <p><strong>Vendor:</strong> {invoices.find(inv => inv._id === selectedInvoiceId)?.vendor}</p>
              <p><strong>Date:</strong> {invoices.find(inv => inv._id === selectedInvoiceId)?.date}</p>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.find(inv => inv._id === selectedInvoiceId)?.products.map((product, index) => (
                    <tr key={index}>
                      <td>{productname}</td>
                      <td>{category}</td>
                      <td>{
                        stockquantity
                      }</td>
                      <td>${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}