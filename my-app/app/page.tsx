"use client"

import NavbarWeb from '@/components/NavbarWeb';
import LandingPage from '@/components/LandingPage';
import Text from '@/components/Text';

import Why from '@/components/Why';
import Features from '@/components/Features';
import '@/styles/globals.css';
import Phone from '@/components/Phone';
import Laptop from '@/components/Laptop';
import Plan from '@/components/Plan';
import { useEffect } from 'react';

import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
const useScrollToHash = () => {

 useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100); // slight delay to ensure render
      }
    }
  }, []);
};
export default function Home() {
    useScrollToHash(); // Add this hook

  return (
    <div className='Home'>
      <NavbarWeb />
      <LandingPage />
      <Why />
      <Features />
      <Phone />
      <Text />
      <Laptop />
      {/* <Plan /> */}
      <Testimonials />
      <Footer />
    </div>
  );
}



