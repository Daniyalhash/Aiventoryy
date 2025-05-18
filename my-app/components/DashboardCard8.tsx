import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '../src/styles/dashboardCard8.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

const DashboardCard8 = ({ title, link , style }) => {
  
  const [openOrders, setOpenOrders] = useState<any[]>([]);

  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success
  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/aiventory/get-invoices/", {
        params: { user_id: userId }
      });
      if (
        response.data &&
        response.data.open_orders &&
        Array.isArray(response.data.open_orders.data)
      ) {
        setOpenOrders(response.data.open_orders.data.map(order => ({
          ...order,
          id: order._id
        })));
      } else {
        setOpenOrders([]);
      }
    } catch (error) {
      setMessage("Failed to load open orders. Please try again.");
      setIsError(true);
      console.error("Error fetching open orders:", error);
      setOpenOrders([]);
    }
  };
    useEffect(() => {

      fetchInvoices();
    }, [userId]);
  const [openActionRow, setOpenActionRow] = useState(null);

  const toggleActions = (id) => {
    setOpenActionRow(openActionRow === id ? null : id);
  };

  return (
    <div className="card8">
      <div className="cardHeader8">
        <h3 className="cardTitle8">{title}</h3>
        <Link href={link}>
          <button className="iconArrow8"><FontAwesomeIcon icon={faArrowRight} /></button>
        </Link>
      </div>

      <div className="tableWrapper8">
        <table className="orderTable8">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Selling Price</th>
              <th>Vendor</th>
            </tr>
          </thead>
          <tbody>
          {openOrders.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id.slice(0, 3)}...</td>
              <td>{invoice.products[0]?.name}</td>
              <td>{invoice.products[0]?.quantity}</td>
              <td>${invoice.products[0]?.price}</td>
              <td>{invoice.vendor}</td>
      
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardCard8;
