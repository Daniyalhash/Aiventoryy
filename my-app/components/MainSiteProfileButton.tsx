// components/MainSiteProfileButton.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faRightFromBracket, faDashboard } from '@fortawesome/free-solid-svg-icons';
import { useUser } from './UserContext';
import '@/styles/profileButton3.css'; // reuse same styles
import { signOut } from "next-auth/react";
import UserAvatar from "./UserAvatar";
import axios from "axios";

const MainSiteProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isArrowUp, setIsArrowUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const profileButtonRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUser();
  // const displayName = user?.username || "Anonymous";
  const displayEmail = user?.email || "N/A";
  const displayShopName = user?.shopname || "N/A";
  // Generate a random color based on the initial

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

    try {
      if (userId) {
        console.log(`Fetching data for userId: ${userId}`);
        const response = await axios.get("https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_user_details/", {
          params: { user_id: userId },
        });
        setUser(response.data); // Update state with user details
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-ignore
        console.error("Error fetching user details:", error.response?.data?.error || error.message);
      } else {
        console.error("Error fetching user details:", (error as Error).message || error);
      }
    }
  }, [userId, setUser]);

  // // Update useEffect dependencies
  // useEffect(() => {
  //   window.updateNavbarUser = fetchUserData;
  //   return () => {
  //     window.updateNavbarUser = null;
  //   };
  // }, [fetchUserData]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(id);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsArrowUp(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const isLoggedIn = !!userId && !!user?.email;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setIsArrowUp(!isArrowUp);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    // signOut({ redirect: false }); // Optional if using NextAuth for social login
    window.location.href = "/";;

  };

  if (!isLoggedIn) {
    return (
      <div className="profileContainer">
        <Link href="/signup" className="signUp">Signup</Link>
        <Link href="/login" className="logIn">Log In</Link>

      </div>
    );
  }

  return (
    <div className="profileContainerWeb">
      <div className="profileWeb" ref={profileButtonRef} onClick={toggleDropdown}>
        <UserAvatar name={displayShopName} size="small" className="" style={{}} />

        <div className="profileInfoWeb">
          <p className="usernameWeb">{displayShopName || "Anonymous"}</p>
        </div>
        <button className="profileIconWeb">
          <FontAwesomeIcon
            icon={isArrowUp ? faAngleUp : faAngleDown}
            className="IconarrowWeb"
          />
        </button>
      </div>

      {isOpen && (
        <div className="dropdownWeb" ref={dropdownRef}>
          <div className="dropdownContentWeb">
            <UserAvatar
              name={displayShopName}
              size="large"
              className="dropdownAvatarWeb"
              style={{ backgroundColor: getAvatarColor() }}
            />

            <p className="dropdownNameWeb">{displayShopName}</p>
            <p className="dropdownPhoneWeb">{displayEmail}</p>
            <div className="dropdownButtonWeb">
              <div title={user?.status === 'complete' 
                ? "Go to dashboard" 
                : "Complete signup to access dashboard"}>

                <button
                  onClick={async () => {
                    if (!userId) {
                      window.location.href = "/login";
                      return;
                    }

                    try {
                      const response = await axios.get(
                        "https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_user_details/",
                        {
                          params: { user_id: userId },
                        }
                      );

                      const userData = response.data;

                      if (userData.status !== "complete") {
                        window.location.href = `/signup?step=2&userId=${userId}&email=${encodeURIComponent(userData.email)}`;
                      } else {
                        window.location.href = "/dashboard";
                      }

                    } catch (error) {
                      console.error("Failed to fetch latest user data:", error);
                      alert("Unable to verify your account status. Please try again.");
                    }
                  }}
                  className={`logoutButtonWeb ${user?.status === 'complete' ? 'btn-green' : 'btn-red'}`}
                >
                  <FontAwesomeIcon icon={faDashboard} className="iconWeb" />
                      {user?.status === 'complete' ? 'Dashboard' : 'Complete Signup'}

                </button>
              </div>
              <div className="lineDiv"></div>
              <button className="logoutButtonWeb" onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} className="IconLogoutWeb" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSiteProfileButton;
