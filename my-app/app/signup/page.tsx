'use client';


import UserCredentials from '@/components/UserCredentials';
import DatasetUpload from '@/components/DatasetUpload';
import DashboardButton from '@/components/DashboardButton';
import '@/styles/SignupPage.css';
import { Suspense } from 'react'; // ✅ Import Suspense
// import { useSearchParams } from 'next/navigation';

import Link from "next/link";
import Image from 'next/image';
// import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
type UserInfo = {
  user_id: string;
  email: string;
  status: string;
};


import axios from 'axios'; // Add this at the top if not already there

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  let urlStep: string | null = null;

  useEffect(() => {
    let user_id = localStorage.getItem('user_id');
    let email = localStorage.getItem('email');

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      user_id = params.get("userId") || user_id;
      email = params.get("email") || email;
      urlStep = params.get("step"); // <-- Read from URL

    }

    if (!user_id || !email) {
      setStep(1);
      setLoading(false);
      return;
    }

    // Save to state
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_user_details/`,
          {
            params: { user_id }
          }
        );

        const data = response.data;

        console.log("API Response:", data);

        if (data.error) {
          throw new Error(data.error || "Failed to fetch user details");
        }

        setFormData({
          user_id,
          email: data.email,
          status: data.status
        });

        // 👇 Scenario override via URL
        if (urlStep === "2") {
          setStep(2); // Force dataset upload
        } else if (urlStep === "3") {
          setStep(3); // Force dashboard button
        } else if (data.status === "complete") {
          setStep(3); // Normal: complete user
        } else {
          setStep(2); // Normal: incomplete user
        }


      } catch (error: any) {
        console.error("Error fetching user details:", error.message);
        setMessage({ text: 'Session expired or invalid user.', type: 'error' });
        localStorage.removeItem('user_id');
        localStorage.removeItem('email');
        setStep(1);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

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
              <Link href="/">

                <Image
                  src="/images/logoPro.png"
                  alt="Logo"
                  className="logImg"
                  width={100}
                  height={100}

                />
              </Link>
            </div>

            <div className="homeLink">
              <Link href="/" className="homeLinkAnchor">
                <span className="arrow">←</span> Home
              </Link>
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




