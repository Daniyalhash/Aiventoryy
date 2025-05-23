'use client';
import UserCredentials from '@/components/UserCredentials';
import DatasetUpload from '@/components/DatasetUpload';
import DashboardButton from '@/components/DashboardButton';
import '@/styles/SignupPage.css';
import { Suspense } from 'react'; // ✅ Import Suspense

import Link from "next/link";
import Image from 'next/image';
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";


const SignupPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdFromUrl = searchParams.get("userId");
  const emailFromUrl = searchParams.get("email");
  const initialStep = parseInt(searchParams.get("step") ?? "1", 10);
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<{ user_id?: string; email: string }>({ email: "" });

  useEffect(() => {
    console.log("Received userId:", userIdFromUrl);
    console.log("Received email:", emailFromUrl);

    if (userIdFromUrl && emailFromUrl) {
      setFormData({ user_id: userIdFromUrl, email: emailFromUrl });
    }
  }, [userIdFromUrl, emailFromUrl]);

  // useEffect(() => {
  //   router.replace(`/signup?step=${step}&userId=${formData.user_id}&email=${encodeURIComponent(formData.email)}`, { scroll: false });
  // }, [step, formData, router]);


  useEffect(() => {
    // Only update URL if we have actual values
    if (step && formData.user_id) {
      router.replace(
        `/signup?step=${step}${formData.user_id ? `&userId=${formData.user_id}` : ''}${formData.email ? `&email=${encodeURIComponent(formData.email)}` : ''}`,
        { scroll: false }
      );
    } else {
      // If we don't have a user_id, just show the step
      router.replace(`/signup?step=${step}`, { scroll: false });
    }
  }, [step, formData, router]);








  const handleCredentialsApproved = (data: { user_id: string; email: string }) => {
    console.log("Credentials Approved:", data);
    setFormData({ ...formData, user_id: data.user_id, email: data.email });
    setStep(2); // Move to Dataset Upload step
  };

  const handleDatasetUploaded = () => setStep(3); // Move to Dashboard Button step

  console.log("Current Step:", step);
  console.log("Form Data:", formData);
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
        
        {step === 1 && <UserCredentials onApproved={handleCredentialsApproved} />}

        {formData.user_id && formData.email && step === 2 && (
          <DatasetUpload userId={formData.user_id} emailId={formData.email} onUploadComplete={handleDatasetUploaded} />
        )}

        {formData.user_id && step === 3 && (
          <DashboardButton userId={formData.user_id} />
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




