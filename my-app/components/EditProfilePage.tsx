// "use client";
// import { useState, useRef, useEffect } from "react";

// import "@/styles/EditProfileOver.css";
// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faChevronLeft,
//   faEdit,
//   faCamera,
//   faSave,
// } from "@fortawesome/free-solid-svg-icons";

// export default function EditProfileOver() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isArrowUp, setIsArrowUp] = useState(false);
//   const [userDetails, setUserDetails] = useState({ username: "", email: "" }); // State for user details
//   const dropdownRef = useRef(null);
//   const profileButtonRef = useRef(null);
//   const [user, setUser] = useState(null);
//   const userId = localStorage.getItem("userId"); // Get userId from localStorage
//   // Get first letter of username
//   const getInitial = () => {
//     return userDetails.username ? userDetails.username.charAt(0).toUpperCase() : 'A';
//   };
//   // Generate a random color based on the initial
//   const getAvatarColor = () => {
//     const colors = [
//       '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
//       '#9966FF', '#FF9F40', '#8AC249', '#EA5F89'
//     ];
//     const charCode = getInitial().charCodeAt(0);
//     return colors[charCode % colors.length];
//   };


//   // Fetch user data when the component mounts or when userId changes
//   const fetchUserData = async () => {

//     try {
//       if (userId) {
//         console.log(`Fetching data for userId: ${userId}`);
//         const response = await axios.get("http://127.0.0.1:8000/aiventory/get-user-details/", {
//           params: { user_id: userId },
//         });
//         setUserDetails(response.data); // Update state with user details
//       }
//     } catch (error) {
//       console.error("Error fetching user details:", error.response?.data?.error || error.message);
//     }
//   };

//   useEffect(() => {
//     fetchUserData(); // Fetch user data when the component is mounted
//   }, [userId]);
//   const handleFileUpload = () => {
//     document.getElementById("fileInput")?.click();
//   };

//   return (
//     <section className="EPsection">
//       {/* Back to Settings Link */}
//       <Link href={"/dashboard/setting"} className="Backsettings">
//         <FontAwesomeIcon icon={faChevronLeft} className="EPicon" />
//         <span>Settings</span>
//       </Link>

//       {/* Header */}
//       <h2 className="EPsecHead">Edit your profile</h2>
  

//       {/* Profile Picture Section */}
//       <div className="profilePicture">
//       <div 
//               className="dropdownInitial" 
//               style={{ backgroundColor: getAvatarColor() }}
//             >
//               {getInitial()}
//             </div>  
//         <button className="updateIcon" onClick={handleFileUpload}>
//           <FontAwesomeIcon icon={faCamera} className="FastupdateIcon" />
//         </button>
//         <input type="file" id="fileInput" style={{ display: "none" }} />
//       </div>

//       {/* User Credentials */}
//       <div className="credentials">
//         <div className="credentialField">
//           <label>Name</label>
//           <div className="fieldContent">
//             <span>John Doe</span>
//             <button className="editIcon">
//               <FontAwesomeIcon icon={faEdit}  className="FastupdateIcon2"/>
//             </button>
//           </div>
//         </div>
//         <div className="credentialField">
//           <label>Shop Name</label>
//           <div className="fieldContent">
//             <span>Doe's Mart</span>
//             <button className="editIcon">
//               <FontAwesomeIcon icon={faEdit} className="FastupdateIcon2"/>
//             </button>
//           </div>
//         </div>
//         <div className="credentialField">
//           <label>Phone Number</label>
//           <div className="fieldContent">
//             <span>+123 456 789</span>
//             <button className="editIcon">
//               <FontAwesomeIcon icon={faEdit} className="FastupdateIcon2"/>
//             </button>
//           </div>
//         </div>
//         <div className="divSave">
//         <button className="saveButton">
//           <FontAwesomeIcon icon={faSave} /> Save
//         </button>
//         </div>
     
//       </div>
//     </section>
//   );
// }
import UserProfileCard from '@/components/UserProfileCard';
import { useState, useRef, useEffect } from "react";

import "@/styles/EditProfileOver.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChevronLeft,
  faEdit,
  faCamera,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
const EditProfilePage = () => {
  const userId = localStorage.getItem("userId");
  
  return (
    <div className="page-container">
      <UserProfileCard userId={userId} />
    </div>
  );
};

export default EditProfilePage;