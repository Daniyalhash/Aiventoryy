'use client';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import React from 'react';
import "@/styles/LandingPage.css";

const LandingPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="landingContainer">
      <h1 data-aos="fade-up">Explore New <br /> Inventory Solutions</h1>
      
      <button className="getStarted" data-aos="zoom-in" data-aos-delay="200">
        Get Started
      </button>

      {/* Dashboard Image Section */}
      <div className="dashboardImage" data-aos="fade-up" data-aos-delay="400">
        <img src="/images/dashboard-mockup.png" alt="Dashboard Preview" />
      </div>

      <div className="dashboardImage2" data-aos="fade-right" data-aos-delay="600">
        <img src="/images/arrow8.png" alt="Arrow" />
      </div>

      <div className="dashboardImage3" data-aos="fade-left" data-aos-delay="800">
        <img src="/images/arrow3.png" alt="Arrow" />
      </div>

      <div className="dashboardImage4" data-aos="zoom-in" data-aos-delay="1000">
        <img src="/images/cross1.png" alt="Icon" />
      </div>

      <div className="dashboardImage5" data-aos="zoom-in" data-aos-delay="1100">
        <img src="/images/cross1.png" alt="Icon" />
      </div>

      <div className="dashboardImage6" data-aos="zoom-in" data-aos-delay="1200">
        <img src="/images/cross1.png" alt="Icon" />
      </div>
    </div>
  );
};

export default LandingPage;
