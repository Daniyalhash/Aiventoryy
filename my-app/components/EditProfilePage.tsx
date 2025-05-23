"use client";
import UserProfileCard from '@/components/UserProfileCard';
import "@/styles/EditProfileOver.css";
import { useEffect, useState } from 'react';

const EditProfilePage = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Access localStorage only in the browser
    const id = localStorage.getItem("userId");
    setUserId(id);
  }, []);

  return (
    <div className="page-container">
      {userId ? (
        <UserProfileCard userId={userId} />
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default EditProfilePage;