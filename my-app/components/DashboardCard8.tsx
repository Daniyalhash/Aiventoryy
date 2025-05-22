import React, { useState, useEffect,useCallback } from 'react';
import Link from 'next/link';
import '../src/styles/dashboardCard8.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

type Order = {
  id: string;
  products: { name: string; quantity: number; price: number }[];
  vendor: string;
};

interface DashboardCard8Props {
  title: string;
  link: string;
}


const DashboardCard8: React.FC<DashboardCard8Props> = ({ title, link }) => {
  
  const [openOrders, setOpenOrders] = useState<Order[]>([]);

  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
const fetchInvoices = useCallback(async () => {
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
      
      console.error("Error fetching open orders:", error);
      setOpenOrders([]);
    }
   }, [userId]); // ✅ include userId as a dependency

     useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]); // ✅ now safe to include fetchInvoices

  

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
