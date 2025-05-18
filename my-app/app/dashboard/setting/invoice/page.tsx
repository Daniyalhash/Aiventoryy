"use client";
// app/dashboard/page.tsx
import InvoiceOver from "@/components/InvoiceOver";
import ShowInvoices from "@/components/ShowInvoices";

import "@/styles/invoice.css";

export default function Invoice() {
  
    return (
      <div className="InvoicePage">
      <InvoiceOver />
        <ShowInvoices />
      </div>
    );
  }
  