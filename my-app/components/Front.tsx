import React from 'react';
import '@/styles/Front.css'; // Import your CSS file

import Image from 'next/image';
const Front = () => {
  return (
    <div className="inventory-dashboard">
      <header>
        <div className="header-content">
          <Image
            src="/images/name.png"
            alt="Hiventoy Logo"
            width={150}
            height={50}
            className="logo"
            priority
          />          <nav>
            <a href="#">Product</a>
            <a href="#">Solutions</a>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Testimonials</a>
          </nav>
          <div className="auth-buttons">
            <button className="signup-button">Sign Up</button>
            <button className="login-button">Log In</button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Explore New Inventory Solutions</h1>
          <button className="get-started-button">Get Started</button>
        </div>
        <Image
          src="/images/Frame1.png"
          alt="Vector Graphic"
          width={500}
          height={300}
          className="vector-graphic"
        />      </section>

      <section className="dashboard-preview">
        {/* Placeholder for the dashboard preview image/content */}
        <div className="dashboard-image-container">
          <div className="dashboard-image">
            <p>Dashboard Preview</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Front;