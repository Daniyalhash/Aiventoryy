import React, { useState, useEffect,useRef,useCallback  } from "react";
import axios from "axios";
import '@/styles/profileButton.css';
import Link from 'next/link';
import { faBell, faQuestionCircle, faAngleUp, faAngleDown, faEye, faCog, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserAvatar from "./UserAvatar";

interface Notification {
  _id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}
import FeatureGuide from '@/components/FeatureGuide';
import { useUser } from "./UserContext";

const ProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isArrowUp, setIsArrowUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUser();
    const [userId, setUserId] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only access localStorage on client side
    const storedUserId = window.localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);  // Get first letter of username
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);
  // Get display username with fallbacks
  // const displayName = user?.username || "Anonymous";
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
    try {
      if (userId) {
        console.log(`Fetching data for userId: ${userId}`);

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/aiventory/get-user-details/`, {
          params: { user_id: userId },
        });
        setUser(response.data); // Update state with user details
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching user details:", error.response?.data?.error || error.message);
      } else {
        console.error("Error fetching user details:", (error as Error).message || error);
      }
    }
  }, [setUser, userId]);
 // Expose refresh function
// useEffect(() => {
//     window.updateNavbarUser = fetchUserData;
//     return () => {
//       window.updateNavbarUser = null;
//     };
//   }, [fetchUserData]);

// Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Close dropdown when clicking outside
  useEffect(() => {
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


  // Fetch unread notification count
  useEffect(() => {
    const fetchAndSetUnreadCount = async () => {
      if (userId) {
        const count = await fetchUnreadNotificationCount(userId);
        setUnreadCount(count);
      }
    };

    fetchAndSetUnreadCount();

    // Refresh the count every 3 minutes (optional)
    const intervalId = setInterval(fetchAndSetUnreadCount, 180000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [userId]);

  const fetchUnreadNotificationCount = async (userId: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/aiventory/get_notifications/`, {
        params: { user_id: userId },
      });

      const notifications = response.data;
      const unreadCount = notifications.filter((n: Notification) => !n.read).length;
      return unreadCount;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      return 0;
    }
  };

  const markAllNotificationsAsRead = async (userId: string) => {
    try {
      await axios.post(`http://127.0.0.1:8000/aiventory/mark_all_as_read/`, {
        user_id: userId,
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setUser(null); 
      window.localStorage.removeItem("userId");

    window.location.href = "/";
  };

  return (
    <div className="profileContainer">
{showFeatureGuide && <FeatureGuide onClose={() => setShowFeatureGuide(false)} />}

      <div className="bellSection">
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
               <Link
                 href="/dashboard/setting/notifications"
                 onClick={async () => {
                   if (userId) {
                     await markAllNotificationsAsRead(userId);
                     setUnreadCount(0); // Reset unread count
                   }
                 }}
               >
                 <div className="bellIcon">
                   <FontAwesomeIcon icon={faBell} className="Iconbell" />
                   {unreadCount > 0 && (
                     <span className="notificationBadge">{unreadCount}</span>
                   )}
                 </div>
               </Link>
             </div>
      </div>

      <div className="profile" ref={profileButtonRef} onClick={toggleDropdown}>
      <UserAvatar name={displayShopName} size="small" className="" style={{}} />
     
           <div className="profileInfo">
          <p className="username">{displayShopName || "Anonymous"}</p>
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
              name={displayShopName} 
              size="large" 
          className="dropdownAvatar"
          style={{ backgroundColor: getAvatarColor() }}

          />
           
           <p className="dropdownName">{displayShopName}</p>
           <p className="dropdownPhone">{displayEmail}</p>
            <div className="dropdownButton">
              <Link href="/dashboard/setting/editProfile" className="logoutButtonDas">
                <FontAwesomeIcon icon={faEye} className="iconDas" />
                Show Profile
              </Link>
              <Link href="/dashboard/setting" className="logoutButtonDas">
                <FontAwesomeIcon icon={faCog} className="iconDas" />
                Settings
              </Link>
              <div className="lineDiv"></div>
              <button className="logoutButtonDas" onClick={handleLogout}>
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

export default ProfileButton;