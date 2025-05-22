"use client";
// app/dashboard/page.tsx
import SectionHeading from '@/components/DashboardOver';
import Cards from '@/components/Cards';
import Cards2 from '@/components/Cards2';  // This is correct import, remove duplicate



import "@/styles/dashboardPage.css";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function DashboardPage() {
  const [username, setUsername] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user just signed up (using sessionStorage)
    const justSignedUp = typeof window !== 'undefined' 
      ? sessionStorage.getItem('justSignedUp') 
      : null
    
    // Get username from localStorage
    const storedUsername = typeof window !== 'undefined' 
      ? localStorage.getItem('username') 
      : null;

    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (justSignedUp) {
      setShowWelcome(true);
      // Remove the flag so it won't show again on refresh
      sessionStorage.removeItem('justSignedUp');
      
      // Hide welcome message after 4 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [router]);  return (
    <div className="dashboardPage">
       {/* Welcome Message */}
       {showWelcome && (
        <div className="welcome-message">
          <div className="welcome-content">
            <div className="welcome-icon">👋</div>
            <h2>Welcome{username ? `, ${username}` : ''}!</h2>
            {/* <p>Your dashboard is ready</p> */}
          </div>
        </div>
      )}
      <SectionHeading />

     <Cards />
  
     <Cards2 />
      {/* Add other DashboardCard components here */}
    </div>
  );
}
