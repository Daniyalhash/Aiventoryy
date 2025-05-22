import '@/styles/ShowInvoice.css';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faCheck, faTimes, faEdit, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from "axios";
import AddInvoice from '@/components/addInvoice';
import Image from 'next/image';

interface Product {
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface Invoice {
  _id: string;
  vendor: string;
  products: Product[];
  total: number;
  status: string;
  created_at: string;
}
interface UserData {
  id: string;
  username: string;
  email: string;
}
interface EditingInvoice extends Invoice {
  id: string;
}

interface ProductChange {
  name: string;
  category: string;
  quantity: number;
  price: number;
}
const ShowInvoices: React.FC = () => {
  const [editedProducts, setEditedProducts] = useState<Product[]>([]);

const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<EditingInvoice | null>(null);

  // const [quantity, setQuantity] = useState<number>(0);
  // const [price, setPrice] = useState<number>(0);
  const pdfRef = useRef<HTMLDivElement>(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [pdfSelectedInvoice, setPdfSelectedInvoice] = useState<number | null>(null);
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchInvoices = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const response = await axios.get("http://127.0.0.1:8000/aiventory/get-invoices/", {
        params: { user_id: userId }
      });
      console.log("Invoices response:", response.data.invoices.data);
      const invoiceList = response.data.invoices.data; // ✅ access .data properly

      if (Array.isArray(invoiceList)) {
        setInvoices(invoiceList.map(invoice => ({
          ...invoice,
          id: invoice._id // ✅ ensure 'id' is available for React key
        })));
      } else {
        setInvoices([]);
      }
    } catch (error) {
      setMessage("Failed to load invoices. Please try again.");
      setIsError(true);
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    }
 }, []);
  console.log("setting values:", invoices);

  // Fetch user data when the component mounts or when userId changes
const fetchUserData = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/aiventory/get-user-details/', {
        params: { user_id: userId }
      });
      setUserData(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }, []);

 useEffect(() => {
    fetchUserData();
    fetchInvoices();
  }, [fetchUserData, fetchInvoices]);


  
  const generatePDF = async (id: number) => {

    setPdfSelectedInvoice(id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(id)
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice || !pdfRef.current) return

    // Temporarily show pdfRef
    const pdfElement = pdfRef.current;
    pdfRef.current.style.position = "absolute";
    pdfRef.current.style.visibility = "visible";

    try {
      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save(`Invoice_${id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Hide pdfRef again after capture
      pdfRef.current.style.position = "absolute";
      pdfRef.current.style.visibility = "hidden";
    }
  };


  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (!isDeleteMode) setSelectedInvoices([]);
  };

  const toggleSelectInvoice = (id: number) => {
    setSelectedInvoices(prev =>
      prev.includes(id)
        ? prev.filter(invoiceId => invoiceId !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedInvoices = async () => {
    if (selectedInvoices.length === 0) {
      setMessage("Please select at least one invoice to delete");
      setIsError(true);
      return;
    }

    try {
      setMessage("Deleting selected invoices...");
      setIsError(false);
      const deletePromises = selectedInvoices.map(id =>
        axios.delete(`http://127.0.0.1:8000/aiventory/delete-invoice/${id}/`, { // Added trailing slash
          params: { user_id: userId },
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const results = await Promise.allSettled(deletePromises);

      // Check results
      const failedDeletes = results.filter(result =>
        result.status === 'rejected' ||
        (result.status === 'fulfilled' && result.value.status !== 200)
      );


      if (failedDeletes.length > 0) {
        setMessage(`${failedDeletes.length} of ${selectedInvoices.length} invoices failed to delete.`);
        setIsError(true);
      } else {
        setMessage("All selected invoices deleted successfully!");
        setIsError(false);
      }

      // Refresh invoices regardless of individual results
      await fetchInvoices();
      setSelectedInvoices([]);
      setIsDeleteMode(false);

    } catch (error) {
      setMessage("Failed to delete invoices. Please try again.");
      setIsError(true);
      console.error("Error deleting invoices:", error);
    }
  };
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    // setQuantity(invoice.products[0]?.quantity || 0);
    // setPrice(invoice.products[0]?.price || 0);

    setEditedProducts(invoice.products);
    setIsEditMode(true);
  };
  useEffect(() => {
    if (editingInvoice) {
      setEditedProducts(editingInvoice.products);
    }
  }, [editingInvoice]);
  const handleProductChange = (index: number, field: keyof ProductChange, value: number | string) => {
  const updatedProducts = [...editedProducts];
  updatedProducts[index] = { ...updatedProducts[index], [field]: value };
  setEditedProducts(updatedProducts);
};

  const openManualInvoice = () => {
    setIsAddingInvoice(true);
  };
  const saveEditedInvoice = async () => {
    if (!editingInvoice) return;

    try {
      setMessage("Updating invoice...");
      setIsError(false);
      const updatedData = {
        user_id: userId,
        products: editedProducts
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/aiventory/update-invoice/${editingInvoice._id}/`,
        updatedData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setMessage("Invoice updated successfully!");
        setIsError(false);
        fetchInvoices();
        setIsEditMode(false);
        setEditingInvoice(null);
      }
    } catch (error) {
      setMessage("Failed to update invoice. Please try again.");
      setIsError(true);
      console.error("Error updating invoice:", error);
    }
  };
  console.log("pdfRef:", pdfRef.current);
  // Handle Confirm Button Click

  const handleConfirmClick = (id: number) => {
    setSelectedInvoiceId(id);
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedInvoiceId(null);
  };

  const handleConfirmOrder = async () => {
    if (!selectedInvoiceId) {
      setMessage("No invoice selected for confirmation");
      setIsError(true);
      return;
    }
    const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);

    if (!selectedInvoice) {
      setMessage("Selected invoice data not found");
      setIsError(true);
      return;
    }
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/aiventory/confirm-invoice/${selectedInvoiceId}/`, // Added trailing slash
        selectedInvoice, // 👈 sending full invoice data

        {
          params: { user_id: userId },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setMessage("Invoice confirmed successfully!");
        setIsError(false);
        fetchInvoices();
        handleClosePopup();

        // Optional: Show confirmation in UI instead of alert
        // setConfirmationMessage("Invoice confirmed!");
        // setTimeout(() => setConfirmationMessage(""), 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        "Failed to confirm invoice";
      setMessage(errorMessage);
      setIsError(true);
      console.error("Confirmation error:", error);
    }
  };

  return (
    <section className="invoice-section">
      {/* Success/Error Message */}
      <div className={`messageContainer ${message ? 'show' : 'hide'} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>
      <div className="invoice-container">
        <div className="invoice-header">
          <h2>Invoices</h2>
          <div className="invoice-actions">
            {isDeleteMode ? (
              <>
                <button
                  onClick={deleteSelectedInvoices}
                  className="action-button danger"
                  disabled={selectedInvoices.length === 0}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete Selected
                </button>
                <button onClick={toggleDeleteMode} className="action-button secondary">
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={toggleDeleteMode} className="action-button danger">
                  <FontAwesomeIcon icon={faTrash} /> Delete Invoices
                </button>
                <button onClick={openManualInvoice} className="action-button primary">
                  <FontAwesomeIcon icon={faPlus} /> Create Invoice
                </button>
              </>
            )}
          </div>
        </div>

        <div className="invoice-list-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Select</th> {/* Keep this always visible */}
                {isDeleteMode && <th>Select</th>}
                <th>#</th>
                <th>Vendor</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                invoice.products.map((product, index) => (
                  <tr key={`${invoice._id}-${index}`} className={
                    selectedInvoices.includes(invoice._id) ? "selected" :
                      pdfSelectedInvoice === invoice._id ? "pdf-selected" : ""
                  }>
                    {/* PDF Selection Checkbox */}
                    <td>
                      {index === 0 && (
                        <input
                          type="radio"
                          name="pdf-selection"
                          checked={pdfSelectedInvoice === invoice._id}
                          onChange={() => setPdfSelectedInvoice(invoice._id)}
                        />
                      )}
                    </td>

                    {/* Delete checkbox */}
                    {isDeleteMode && (
                      <td>
                        {index === 0 && (
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice._id)}
                            onChange={() => toggleSelectInvoice(invoice._id)}
                          />
                        )}
                      </td>
                    )}

                    {/* ID, Vendor, etc. only on first product row */}
                    <td>{index === 0 ? invoice._id : ""}</td>
                    <td>{index === 0 ? invoice.vendor : ""}</td>

                    {/* Product-specific data */}
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price}</td>

                    {/* Only show total on first row */}
                    <td>{index === 0 ? `$${invoice.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}` : ""}</td>
                    <td>{index === 0 ? invoice.formatted_date : ""}</td>

                    {/* Actions only on first row */}
                    <td className="action-buttons">
                      {index === 0 && (
                        <>
                          <button
                            onClick={() => {
                              if (!pdfSelectedInvoice) {
                                setMessage("Please select an invoice first!");
                                setIsError(true);
                                return;
                              }
                              generatePDF(pdfSelectedInvoice);
                            }}
                            className="view-pdf-button"
                            title="Download PDF"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="edit-button"
                            title="Edit Invoice"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleConfirmClick(invoice.id)}
                            className="confirm-button"
                            title="Confirm Order"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>

          </table>
          {invoices.length === 0 && (
            <div className="empty-state">
              <p>No invoices found. Create your first invoice!</p>
            </div>
          )}
        </div>

        {isEditMode && editingInvoice && (
          <div className="modal-overlayY">
            <div className="modal-contentY">
              <h3>Edit Invoice #{editingInvoice._id}</h3>

              {editedProducts.map((product, idx) => (
                <div key={idx} className="product-edit-section">
                  <h4>Product {idx + 1}</h4>

                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={product.name}
                      readOnly
                      className="read-only-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(idx, 'quantity', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(idx, 'price', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Total</label>
                    <input
                      type="text"
                      value={`$${(product.quantity * product.price).toFixed(2)}`}
                      readOnly
                      className="read-only-input"
                    />
                  </div>
                </div>
              ))}

              <div className="modal-actions">
                <button onClick={() => setIsEditMode(false)} className="cancel-button">
                  Cancel
                </button>
                <button onClick={saveEditedInvoice} className="save-button">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Confirmation Popup */}
        {isPopupOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Order</h3>
              <p>Are you sure you want to confirm this order?</p>
              <div className="modal-actions">
                <button onClick={handleClosePopup} className="cancel-button">
                  Cancel
                </button>
                <button onClick={handleConfirmOrder} className="confirm-button">
                  Yes, Confirm
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Modal for Add Form */}
        {isAddingInvoice && (
          <div className="modal-overlayX">
            <div className="modal-overlayX">
              <div className="modal-contentX">
                <div className="formHead">
                  <h1 className="formHeadH1">Create Invoice</h1>
                  <button className="close-icon-buttonX" onClick={() => setIsAddingInvoice(false)}>✖</button>
                </div>

                <div className="form-content">
                  <AddInvoice />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Hidden PDF generator */}
        {/* Hidden PDF generator */}
        <div
          ref={pdfRef}
          id="pdf-content"
          style={{
            position: 'absolute',
            left: '-9999px',
            visibility: 'hidden',
            backgroundColor: 'white',
            padding: '20px',
            width: '210mm'
          }}
        >
          {pdfSelectedInvoice !== null && (() => {
            const currentInvoice = invoices.find(inv => inv.id === pdfSelectedInvoice);
            if (!currentInvoice) return null;

            // const product = currentInvoice.products[0];
            const total = currentInvoice.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

            return (
              <div className="invoice-pdf">
                {/* PDF content template */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <Image src="/images/logoPro.png"
                      alt="Logo"
                      width={100}
                      height={50}
                      hidden />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ color: '#17412d', marginBottom: '10px' }}>INVOICE</h2>
                    <p><strong>Invoice #:</strong> {currentInvoice.id}</p>
                    <p><strong>Date:</strong> {new Date(currentInvoice.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Vendor and Client Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                  <div style={{ width: '48%', border: '1px solid #eee', padding: '10px' }}>
                    <h3 style={{ color: '#17412d', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Vendor Details</h3>
                    <p><strong>Name:</strong> {currentInvoice.vendor}</p>
                    <p><strong>Phone:</strong> {currentInvoice.vendorPhone || 'N/A'}</p>
                  </div>
                  <div style={{ width: '48%', border: '1px solid #eee', padding: '10px' }}>
                    <h3 style={{ color: '#17412d', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Client Details</h3>
                    <p><strong>Name:</strong> {localStorage.getItem('username') || 'Anonymous'}</p>
                    <p><strong>Email:</strong> {localStorage.getItem('email') || 'N/A'}</p>
                  </div>
                </div>

                {/* Products Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#17412d', color: 'white' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.products.map((product, index) => {
                      const amount = product.price * product.quantity;
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{index + 1}</td>
                          <td style={{ padding: '10px' }}>
                            <strong>{product.name}</strong><br />
                            <small>Category: {product.category}</small>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{product.quantity}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>${product.price.toFixed(2)}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>${amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>

                {/* Totals */}
                <div style={{ float: 'right', width: '300px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #17412d', marginTop: '5px', paddingTop: '5px' }}>
                    <strong>Total:</strong>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #eee', paddingTop: '10px', fontSize: '12px' }}>
                  <p style={{ textAlign: 'center' }}>
                    <strong>Thank you for your business!</strong><br />
                    For any questions, contact {localStorage.getItem('email') || 'N/A'}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
export default ShowInvoices;