"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import '@/styles/Phone.css';

const Phone = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="phone-container">
      <div className="phone-content">
        
        {/* Left Section */}
        <div className="left-section" data-aos="fade-right">
          <h2 className="title">
            <span className="customer">Customer</span> Barcode Scanning
          </h2>
          <p className="description" data-aos="fade-up" data-aos-delay="200">
            Scan products to get real-time product details and alternatives.
          </p>
          <div className="buttonContainer" data-aos="fade-up" data-aos-delay="400">
            <button className="download-button">Download now</button>
            <button className="download-button-icon">
              <Image src="/images/apple.png" alt="Apple Store" width={20} height={20} />
            </button>
            <button className="download-button-icon">
              <Image src="/images/playstore.png" alt="Google Play" width={20} height={20} />
            </button>
          </div>
        </div>
  
        {/* Right Section */}
        <div className="right-section" data-aos="zoom-in">
          <Image
            src="/images/phone.png"
            alt="iPhone Prototype"
            width={250}
            height={500}
            className="phone-image"
          />
  
          {/* Floating Buttons */}
          <div className="floating-button alternatives" data-aos="fade-left" data-aos-delay="500">
            <span className="text-gray">Get Product </span>
            <span className="text-green">Alternatives</span>
          </div>
          <div className="floating-button details" data-aos="fade-right" data-aos-delay="700">
            <span className="text-gray">Get Product </span>
            <span className="text-green">Details</span>
          </div>
        </div>
  
      </div>
    </div>
  );
  
};

export default Phone;