
'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faUsers, faCogs } from '@fortawesome/free-solid-svg-icons';
import '../src/styles/NavbarWeb.css';
// import ProfileButton2 from '@/components/ProfileButton2';
// import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NavbarWeb = () => {
  const pathname = usePathname();
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const router = useRouter();
// Check authentication status and session expiry
// const checkAuthStatus = () => {
//   const userId = localStorage.getItem("userId");
//   const loginTime = localStorage.getItem("loginTime");
  
//   if (userId && loginTime) {
//     const currentTime = new Date().getTime();
//     const elapsedTime = currentTime - parseInt(loginTime);
//     const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
//     if (elapsedTime > twentyFourHours) {
//       // Session expired
//       localStorage.removeItem("userId");
//       localStorage.removeItem("loginTime");
//       setIsLoggedIn(false);
//       router.push('/login');
//       return false;
//     }
//     return true;
//   }
//   return false;
// };

// useEffect(() => {
//   // Check auth status on component mount
//   const isAuthenticated = checkAuthStatus();
//   setIsLoggedIn(isAuthenticated);

//   // Set up periodic check every hour
//   const interval = setInterval(() => {
//     checkAuthStatus();
//   }, 60 * 60 * 1000); // Check every hour

//   return () => clearInterval(interval);
// }, []);

  return (
    <nav className="navbar">
      <div className="logo">
      <Link href="/">
      <img src="/images/logoPro3.png" alt="Logo" className="logImg" />
      </Link>
      </div>
      <div className="menu">
      <Link href="/dashboard">
           Product 
         </Link>
         <Link href="/dashboard/inventory">
           Solution
         </Link>
         <Link href="/dashboard/vendor">
          Features
         </Link>
         <Link href="/dashboard/insights">
           Pricing
         </Link>
         <Link href="/">
           Testimonials
         </Link>
      </div>
      <div className="authButtons">
       
            <Link href="/signup">
              <button className="signUp">Sign Up</button>
            </Link>
            <Link href="/login">
              <button className="logIn">Log In</button>
            </Link>
         
      </div>
    </nav>
  );
};

export default NavbarWeb;
{/* <Link href="/signup">
<button className="signUp">Sign Up</button>
</Link>
<Link href="/login">
<button className="logIn">Log In</button>
</Link> */}
// npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
// {isLoggedIn ? (
//   <ProfileButton2 />
// ) : (
//   <>
//     <Link href="/signup">
//       <button className="signUp">Sign Up</button>
//     </Link>
//     <Link href="/login">
//       <button className="logIn">Log In</button>
//     </Link>
//   </>
// )}