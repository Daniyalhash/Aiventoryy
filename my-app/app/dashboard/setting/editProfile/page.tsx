"use client";
// app/dashboard/page.tsx
import EditProfilePage from "@/components/EditProfilePage"
import EditProfileOver from '@/components/EditProfileOver';

import "@/styles/editProfile.css";

export default function EditProfile() {
  
    return (
      <div className="EditProfilepage">
        <EditProfileOver />
      <EditProfilePage />
        
      </div>
    );
  }
  