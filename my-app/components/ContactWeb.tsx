import React from "react";
import "@/styles/Contact.css";
import Image from 'next/image';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-left">
        <h4 className="contact-heading">Get in touch</h4>
        <h2 className="contact-title">Lets Chat, Reach Out to Us</h2>
        <p className="contact-description">
          Have question or feedback? Were here to help. Send us a message and
          well respond within 24 hours.
        </p>
        <form className="contact-form">
          <input type="text" placeholder="Full Name" className="contact-input" />
          <input type="email" placeholder="Email Address" className="contact-input" />
          <textarea placeholder="Message" className="contact-input message-input"></textarea>
          <button type="submit" className="contact-button">Submit</button>
        </form>
      </div>

      <div className="contact-right">
        
  
        <Image 
        src="/images/telephone.png" 
        alt="Contact" 
        className="contact-image"
        width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority />
        <div className="contact-info">
          <div className="info-box">
            <span className="info-icon">📧</span>
            <div>
              <h5>Email</h5>
              <p>pingpong@hotmail.com</p>
            </div>
          </div>
          <div className="info-box">
            <span className="info-icon">📞</span>
            <div>
              <h5>Phone</h5>
              <p>0322-3232345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
