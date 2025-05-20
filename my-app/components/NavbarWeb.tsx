
'use client';

import Link from 'next/link';
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faUsers, faCogs } from '@fortawesome/free-solid-svg-icons';
import '../src/styles/NavbarWeb.css';
// import ProfileButton2 from '@/components/ProfileButton2';
// import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainSiteProfileButton from './MainSiteProfileButton';
// npm install next-auth
import { useUser } from "@/components/UserContext"; // adjust the path as needed
const scrollToSection = (id) => {
  const section = document.querySelector(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};
const NavbarWeb = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [storedUser, setStoredUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isClient, setIsClient] = useState(false); 
  const isLoggedIn = !!user;

  console.log("user currentlu", storedUser)
useEffect(() => {
    setIsClient(true);

    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      try {
        const parsedUser = JSON.parse(userFromStorage);
        setStoredUser(parsedUser);
        setUserId(parsedUser.id || parsedUser.userId || "N/A");
        console.log("User from localStorage:", parsedUser);
      } catch (e) {
        console.error("Invalid user JSON in localStorage:", e);
        localStorage.removeItem("user");
      }
    } else {
      console.log("No user found in localStorage.");
    }
  }, []);


  return (
    <nav className="navbarWeb">
      <div className="logoWeb">
        <Link href="/">
          <img src="/images/logoPro3.png" alt="Logo" className="logImgWeb" />
        </Link>
      </div>
      <div className="menuWeb">
        <a className="item" onClick={() => scrollToSection("#product-section")}>Product</a>
        <a className="item" onClick={() => scrollToSection("#solution-section")}>Solution</a>
        <a className="item" onClick={() => scrollToSection("#features-section")}>Features</a>
        <a className="item" onClick={() => scrollToSection("#pricing-section")}>Pricing</a>
        <a className="item" onClick={() => scrollToSection("#testimonials-section")}>Testimonials</a>

        {/* <Link className='item' href="#product-section">
          Product
        </Link> */}
        {/* <Link className='item' href="#solution-section">
          Solution
        </Link>
        <Link className='item'href="#features-section">
          Features
        </Link>
        <Link className='item'href="#pricing-section">
          Pricing
        </Link>
        <Link className='item'href="#testimonials-section">
          Testimonials
        </Link> */}
      </div>
      <div className="authButtons">
        {isLoggedIn ? (
          <MainSiteProfileButton />
        ) : (
          <>
            <Link href="/signup">
              <button className="signUp">Sign Up</button>
            </Link>
            <Link href="/login">
              <button className="logIn">Log In</button>
            </Link>
          </>
        )}
      </div>

    </nav>
  );
};

export default NavbarWeb;
