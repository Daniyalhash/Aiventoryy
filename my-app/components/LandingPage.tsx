'use client';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import React from 'react';
import Link from 'next/link';
import "@/styles/LandingPage.css";
import Image from 'next/image';

const LandingPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div id="product-section" className="landingContainer">
      <h1 data-aos="fade-up">Explore New <br /> Inventory Solutions</h1>
      
      <button  className="getStarted" data-aos="zoom-in" data-aos-delay="200">
        <Link  className="getStarted" href="/signup">Get Started</Link>
        
      </button>

      {/* Dashboard Image Section */}
      <div className="dashboardImage" data-aos="fade-up" data-aos-delay="400">
        <Image 
          src="/images/dashboard-mockup.png" 
          alt="Dashboard Preview"
          width={800}
          height={600}
          priority
        />
      </div>

      <div className="dashboardImage2" data-aos="fade-right" data-aos-delay="600">
       <Image 
          src="/images/arrow8.png" 
          alt="Arrow"
          className="responsive-image"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority
        />
      </div>

      <div className="dashboardImage3" data-aos="fade-left" data-aos-delay="800">
        <Image 
          src="/images/arrow3.png" 
          className="responsive-image"
                    alt="Decorative arrow" // Added alt text

          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority 
          />
      </div>

      <div className="dashboardImage4" data-aos="zoom-in" data-aos-delay="1000">
        <Image 
        src="/images/cross1.png" 
        alt="Icon" 
        className="responsive-image"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority 
        />
      </div>

      <div className="dashboardImage5" data-aos="zoom-in" data-aos-delay="1100">
        <Image 
        src="/images/cross1.png"
         alt="Icon"
         className="responsive-image"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority 
          />
      </div>

      <div className="dashboardImage6" data-aos="zoom-in" data-aos-delay="1200">
        <Image
         src="/images/cross1.png"
          alt="Icon"
          className="responsive-image"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority 
           />
      </div>
    </div>
  );
};

export default LandingPage;
