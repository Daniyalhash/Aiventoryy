'use client';
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import '@/styles/Text.css';

const Text = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    });
  }, []);

  return (
    <div className="text-section">
      <div className="text-container">
        
        {/* Outlined AI Text */}
        <div className="outlined-text" data-aos="fade-right" data-aos-delay="600">
          AI
        </div>

        {/* Foreground Bold Text */}
        <h1 className="main-text-2" data-aos="fade-right" data-aos-delay="300">
          EXPERIENCE <br />
          THE FUTURE <br />
          OF
        </h1>

        <h1 className="main-text">
          EXPERIENCE <br />
          THE FUTURE <br />
          OF
        </h1>
      </div>
    </div>
  );
};

export default Text;
