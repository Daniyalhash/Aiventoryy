
'use client';

import Link from 'next/link';
import { useEffect, useState } from "react";


import '@/styles/NavbarWeb.css';
import Image from 'next/image';
import MainSiteProfileButton from './MainSiteProfileButton';
// npm install next-auth
import { useUser } from "@/components/UserContext"; // adjust the path as needed
const scrollToSection = (sectionId: string): void => {
  const section = document.querySelector(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};
interface ParsedUser {
  id?: string;
  userId?: string;
}
const NavbarWeb = () => {
  const { user } = useUser();
  const [storedUser, setStoredUser] = useState<ParsedUser | null>(null);
 
  const isLoggedIn = !!user;

  console.log("user currentlu", storedUser)
  useEffect(() => {
   
    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      try {
        const parsedUser = JSON.parse(userFromStorage);
        setStoredUser(parsedUser);
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
          <Image 
          src="/images/logoPro3.png"
           alt="Logo"
            className="logImgWeb"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority
            
            />
        </Link>
      </div>
      <div className="menuWeb">
        <a className="item" onClick={() => scrollToSection("#product-section")}>Product</a>
        <a className="item" onClick={() => scrollToSection("#solution-section")}>Solution</a>
        <a className="item" onClick={() => scrollToSection("#features-section")}>Features</a>
        <a className="item" onClick={() => scrollToSection("#pricing-section")}>Pricing</a>
        <a className="item" onClick={() => scrollToSection("#testimonials-section")}>Testimonials</a>

     
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
