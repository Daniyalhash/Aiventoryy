import { useState, useRef, useEffect,useCallback  } from "react";
import axios from "axios";
import '@/styles/profileButton2.css';
import Link from 'next/link';
import {  faCog, faAngleDown, faRightFromBracket, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserAvatar from "./UserAvatar";

import FeatureGuide from '@/components/FeatureGuide';
import { useUser } from "./UserContext";
const ProfileButton2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isArrowUp, setIsArrowUp] = useState(false);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const { user, setUser } = useUser();
  // const userId = localStorage.getItem("userId"); // Get userId from localStorage
  // Get first letter of username
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);
  // Get display username with fallbacks
  const displayName = user?.username || "Anonymous";
  const displayEmail = user?.email || "N/A";

    const displayShopName = user?.shopname || "N/A";

   // Generate a random color based on the initial
  const getAvatarColor = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#8AC249', '#EA5F89'
    ];
    const initial = displayShopName.charAt(0).toUpperCase();
    const charCode = initial.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Fetch user data when the component mounts or when userId changes
  const fetchUserData = useCallback(async () => {
 const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      if (userId) {
        console.log(`Fetching data for userId: ${userId}`);
        const response = await axios.get("http://127.0.0.1:8000/aiventory/get-user-details/", {
          params: { user_id: userId },
        });
        setUser(response.data); // Update state with user details
      }
    } catch (error) {
      console.error("Error fetching user details:", error.response?.data?.error || error.message);
    }
  }, [setUser]);
 // Expose refresh function
useEffect(() => {
    window.updateNavbarUser = fetchUserData;
    return () => {
      window.updateNavbarUser = null;
    };
  }, [fetchUserData]);
// Initial data fetch
useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsArrowUp(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);
  // Close dropdown when navigating to a different page
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
      setIsArrowUp(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setIsArrowUp(!isArrowUp);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setUser(null); // Clear user from context

    window.location.href = "/";
  };

  return (
    <div className="profileContainer">
{showFeatureGuide && <FeatureGuide onClose={() => setShowFeatureGuide(false)} />}

      {/* <div className="bellSection">
        <div className="bellIconContainer">
        <div 
      className="bellIcon" 
      onClick={() => setShowFeatureGuide(true)}
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="Iconbell" />
    </div>
        </div>
        <div className="bellIconContainer">
          <div className="divLine"></div>
        </div>
        <div className="bellIconContainer">
          <Link href="/dashboard/setting/notifications">
            <div className="bellIcon">
              <FontAwesomeIcon icon={faBell} className="Iconbell" />
            </div>
          </Link>
        </div>
      </div> */}

      <div className="profile" ref={profileButtonRef} onClick={toggleDropdown}>
      <UserAvatar name={displayName} size="small" />
     
           <div className="profileInfo">
          <p className="username">{displayName || "Anonymous"}</p>
        </div>
        <button className="profileIcon">
          <FontAwesomeIcon
            icon={isArrowUp ? faAngleUp : faAngleDown}
            className="Iconarrow"
          />
        </button>
      </div>

      {isOpen && (
        <div className="dropdown" ref={dropdownRef}>
          <div className="dropdownContent">
          <UserAvatar 
              name={displayName} 
              size="large" 
          className="dropdownAvatar"
          style={{ backgroundColor: getAvatarColor() }}

          />
           
           <p className="dropdownName">{displayName}</p>
           <p className="dropdownPhone">{displayEmail}</p>
            <div className="dropdownButton">
              <Link href="/dashboard" className="logoutButton">
                <FontAwesomeIcon icon={faCog} className="icon" />
                Dashboard
              </Link>
              <div className="lineDiv"></div>
              <button className="logoutButton" onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} className="IconLogout" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton2;