'use client';


import UserCredentials from '@/components/UserCredentials';
import DatasetUpload from '@/components/DatasetUpload';
import DashboardButton from '@/components/DashboardButton';
import '@/styles/SignupPage.css';
import { Suspense } from 'react'; // ✅ Import Suspense
// import { useSearchParams } from 'next/navigation';

import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
type UserInfo = {
  user_id: string;
  email: string;
  status: string;
};


const SignupPage = () => {
  // const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    // const user_id = localStorage.getItem('userId');
    // const email = localStorage.getItem('email');
    let user_id = localStorage.getItem('user_id');
    let email = localStorage.getItem('email');

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      user_id = params.get("userId") || user_id;
      email = params.get("email") || email;
    }
    // Get 'step' from query param if exists
    let stepFromQuery = 1;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      stepFromQuery = stepParam ? parseInt(stepParam) : 1;
    }
    if (!user_id || !email) {
      setStep(1); // No user found, start at credentials
      setLoading(false);
      return;
    }

    // Fetch user status from backend

    fetch(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-user-details?user_id=${user_id}`)
      .then(res => res.json())
      .then(data => {
        console.log("API response:", data); // Debug API response

        if (data.error) {
          console.error("User fetch error:", data.error);
          localStorage.removeItem('user_id');
          localStorage.removeItem('email');
          alert("Session expired or invalid user. Please start over.");
          setStep(1);
        } else {
          setFormData({
            user_id,
            email: data.email,
            status: data.status
          });

          // Decide next step based on user status
          if (data.status === "complete") {
            setStep(3); // Go to Dashboard
          } else {
            setStep(2); // Directly go to DatasetUpload when status is incomplete
          }
        }
      })
      .catch(err => {
        console.error("Fetch failed:", err);
        setStep(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);



  console.log("Initial user_id:", formData?.user_id);
  console.log("Initial email:", formData?.email);



  const handleCredentialsApproved = (data: { user_id: string; email: string }) => {
    console.log("Credentials Approved:", data);
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("email", data.email);
    setFormData({ user_id: data.user_id, email: data.email, status: "incomplete" });
    setStep(2); // Move to Dataset Upload step
  };

  const handleDatasetUploaded = () => setStep(3); // Move to Dashboard Button step

  console.log("Current Step:", step);
  console.log("Form Data:", formData);
  if (loading) return <div className="SignInContainer">Loading...</div>;

  return (
    <Suspense fallback={<div>Loading signup page...</div>}>
      <div className="SignInContainer">
        {/* Right Section */}


        {/* Left Section */}
        <div className="signLeft">
          <div className="logocontainer">
            <div className="logo">
              <Image
                src="/images/logoPro.png"
                alt="Logo"
                className="logImg"
                width={100}
                height={100}
                hidden
              />
            </div>


          </div>



          {/* Login Form */}

          {/* Step 1: User Credentials */}
          {loading ? (
            <p>Loading...</p>) : step === 1 ? (
              <UserCredentials onApproved={handleCredentialsApproved} />
            ) : step === 2 ? (

              <DatasetUpload userId={formData?.user_id ?? ''} emailId={formData?.email ?? ''} onUploadComplete={handleDatasetUploaded} />
            ) : step === 3 ? (


              <DashboardButton userId={formData?.user_id ?? ''} />
            ) : (
            <p>Unknown step</p>
          )}



        </div>
        <div className="signRight">
          <div className="logoRight">
            <Link href="/">
              <Image
                src="/images/logoPro2.png"
                alt="Logo"
                className="logImg"
                width={100}
                height={100}
                style={{ cursor: 'pointer' }} // Optional: Add pointer cursor
              />
            </Link>
          </div>
          {/* 3D Look Animated Video */}
          <video
            className="animatedVideo"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/video/vid2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </Suspense>
  );
};

export default SignupPage;




