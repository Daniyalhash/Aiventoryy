"use client";
// app/dashboard/page.tsx
import EditDataPage from "@/components/EditDataPage"
import DataOver from '@/components/DataOver';

import "@/styles/editProfile.css";

export default function Data() {
  
    return (
      <div className="EditProfilepage">
        <DataOver />
      <EditDataPage />
        
      </div>
    );
  }
  