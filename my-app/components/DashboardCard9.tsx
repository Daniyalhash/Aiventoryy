import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '../src/styles/dashboardCard9.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import VendorReliabilityTooltip from '@/components/VendorReliabilityTooltip'

import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
const DashboardCard9 = ({ title, link, subTitle }) => {
  const [showPopup, setShowPopup] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [invoices2, setInvoices2] = useState([]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/aiventory/get-invoices/", {
        params: { user_id: userId }
      });
      console.log('open orders response:', response.data.open_orders);
      const response2 = await axios.get("http://127.0.0.1:8000/aiventory/get_user_received_orders/", {
        params: { user_id: userId }
      });
      console.log('open orders response2:', response2.data);
      // Handle the open orders
      if (response.data && response.data.open_orders && Array.isArray(response.data.open_orders.data)) {
        setOpenOrders(response.data.open_orders.data.map(order => ({
          ...order,
          id: order._id
        })));
      } else {
        setOpenOrders([]);
      }

      // Handle the received orders
      if (response2.data && Array.isArray(response2.data.orders)) {
        setInvoices(response2.data.orders.map(inv => ({
          ...inv,
          id: inv._id
        })));
      } else {
        setInvoices([]);
      }
    } catch (error) {
      setMessage("Failed to load open orders. Please try again.");
      setIsError(true);
      console.error("Error fetching open orders:", error);
      setOpenOrders([]);
    }
  };
  console.log('Invoices:', invoices);
  const [isUpdating, setIsUpdating] = useState(false);


  const handleDelete = async (invoiceId) => {
    setIsUpdating(true);
    console.log('Starting handleDelete with:', { invoiceId, userId });
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.delete("http://127.0.0.1:8000/aiventory/delete_open_order_invoice/", {
        data: {
          invoice_id: invoiceId,
          user_id: userId,
        },
      });

      console.log('API Response for delete:', response.data);
      await fetchInvoices(); // Refresh list
      setMessage("Invoice deleted successfully.");
    } catch (error) {
      console.error("Deletion error:", error);
      setMessage("Failed to delete invoice.");
      setIsError(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReceivedOrder = async (invoiceId) => {
    setIsUpdating(true);
    console.log('Starting handleDeleteReceivedOrder with:', { invoiceId, userId });
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.delete("http://127.0.0.1:8000/aiventory/delete_received_order_invoice/", {
        data: {
          invoice_id: invoiceId,
          user_id: userId,
        },
      });

      console.log('API Response for delete:', response.data);
      await fetchInvoices(); // Refresh list after deletion
      setMessage("Received order invoice deleted successfully.");
    } catch (error) {
      console.error("Deletion error:", error);
      setMessage("Failed to delete received order invoice.");
      setIsError(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // const handleDeleteInvoice = (invoiceId) => {
  //   // Filter out the invoice with the given ID
  //   const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);

  //   // Update the state with the new list of invoices
  //   setInvoices(updatedInvoices);
  // };



  const handleReceived = async (invoiceId, vendor_id) => {
    setIsUpdating(true);
    console.log('Starting handleReceived with:', { invoiceId, vendor_id, userId });
    setMessage(""); // Reset message before processing
    setIsError(false); // Reset error state
    try {
      // Find the invoice to get its creation timestamp
      const invoice = openOrders.find(inv => inv.id === invoiceId);
      console.log('Found invoice:', invoice);

      if (!invoice || !invoice.formatted_date) {
        throw new Error("Invoice date information missing");
      }

      // Parse the formatted date (e.g., "09:37 (05/01/2025)")
      console.log('Raw formatted_date:', invoice.formatted_date);

      const orderDate =  invoice.formatted_date;
      

      console.log("📦 order date  took:", orderDate, "days");
    
      // Log before API call
      const payload = {
        userId: userId,
        vendor_id: vendor_id,
        orderDate:orderDate,
        invoice_data: invoice  // Add full invoice object

      };
      console.log('Sending payload vendor :', payload);
      // Update vendor's reliability score and delivery time
      const response = await axios.post("http://127.0.0.1:8000/aiventory/update_vendor_reliability/",

        payload
      );
      console.log('API Response:', response.data);

      if (response.status !== 200) {
        throw new Error("Failed to update vendor reliability");
      }



      setMessage(`Order received! Delivery time hours. Vendor score updated.`);
      setIsError(false);
      fetchInvoices(); // Refresh the list
      handleDelete(invoiceId); // Delete the invoice after processing
      setMessage("Vendor arrived with stock successfully.");
      setIsError(false);
    } catch (error) {
      setMessage("Failed to process receipt. Please try again.");
      setIsError(true);
      console.error("Error processing receipt:", error);
      setMessage(error.response?.data?.error || "Failed to process receipt. Please try again.");
      setIsError(true);
    } finally {
      setIsUpdating(false);
    }
  };


  useEffect(() => {
    fetchInvoices();

  }, [userId]);  // Make sure userId is properly memoized or stable
  const [openActionRow, setOpenActionRow] = useState(null);

  const toggleActions = (id) => {
    setOpenActionRow(openActionRow === id ? null : id);
  };
  // Function to handle deleting an invoice


  return (
    <div className="card9">
      {message && (
        <div className={`messageContainer show ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
            {isError && (
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
      <div className="cardHeader9">
        <div className="cardHead">
          <h3 className="cardTitle9">{title}</h3>
          <VendorReliabilityTooltip />
        </div>
        <h3 className='cardTitle19' onClick={() => setShowPopup(true)} style={{ cursor: "pointer", textDecoration: "underline" }}>
          {subTitle}
        </h3>
      </div>

      <div className="tableWrapper9">
        <table className="orderTable9">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Selling Price</th>
              <th>Total</th>
              <th>Vendor</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {openOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: "40px 0" }}>
                  <div className="emptyStateBox">
                    <p>🚫 No open orders placed yet</p>
                    <small>Add a new order to get started</small>
                  </div>
                </td>
              </tr>
            ) : (
              openOrders.flatMap((invoice) =>
                invoice.products.map((product, index) => (
                  <tr key={`${invoice._id}-${index}`}>
                    <td>{invoice._id}</td>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price}</td>
                    <td>${(product.quantity * product.price).toFixed(2)}</td>
                    <td>{invoice.vendor}</td>
                    <td>{invoice.formatted_date}</td>
                    <td className="actionCell19">
                      {/* Only show actions for the first product row of each invoice */}
                      {index === 0 && (
                        <div className={`actionContainer19 ${openActionRow === invoice._id ? 'active' : ''}`}>
                          <button
                            className="actionToggleBtn19"
                            onClick={() => toggleActions(invoice._id)}
                          >
                            Actions
                          </button>
                          <div className="actionMenu19">
                            <button
                              className="receivedBtn19"
                              onClick={() => handleReceived(invoice._id, invoice.vendor_id)}
                            >
                              {isUpdating ? 'Updating...' : 'Received'}
                            </button>
                            <button
                              className="deleteBtn19"
                              onClick={() => handleDelete(invoice._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="icon" />
                            </button>
                            <button
                              className="closeActionBtn19"
                              onClick={() => toggleActions(null)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showPopup && (
        <div className="invoice-modal-overlay">
          <div className="invoice-modal">
            <div className="invoice-management">
              <h2>Successfull Received Orders</h2>
              <button className="close-modal" onClick={() => setShowPopup(false)}>×</button>
            </div>

            <div className="invoice-list">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div className="invoice-card" key={invoice.id}>
                    <p><strong>Order ID:</strong> {invoice.id}</p>
                    <p><strong>Product:</strong> {invoice.products[0]?.name}</p>
                    <p><strong>Quantity:</strong> {invoice.products[0]?.quantity}</p>
                    <p><strong>Total:</strong> ${invoice.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}</p>
                    <p><strong>Vendor:</strong> {invoice.vendor}</p>
                    <p><strong>Date:</strong> {invoice.formatted_date}</p>
                    {/* Delete Button/Icon */}
                    <button
                      className="deleteBtn19"
                      onClick={() => handleDeleteReceivedOrder(invoice._id)}
                      style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p>No received orders found.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardCard9;
