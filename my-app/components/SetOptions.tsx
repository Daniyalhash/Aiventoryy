"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBell,
  faInbox,
  faUpload,
  faSignOutAlt,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "@/styles/settingsPage.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type LinkOption = {
  name: string;
  path: string;
  icon: IconDefinition;
  className?: string;
};

type ActionOption = {
  name: string;
  action: () => void;
  icon: IconDefinition;
  className?: string;
};
type Option = LinkOption | ActionOption;

const defaultSettingsOptions = [
  { name: "Edit Profile", path: "/dashboard/setting/editProfile", icon: faUser },
  { name: "Notifications", path: "/dashboard/setting/notifications", icon: faBell },
  { name: "Invoice Center", path: "/dashboard/setting/invoice", icon: faInbox },
    { name: "Upload Data", path: "/dashboard/setting/data", icon: faUpload },


];

const SetOptions: React.FC<{ additionalOptions?: Option[] }> = ({ additionalOptions = [] }) => {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    console.log("User logged out");
    window.location.href = "/";
  };

  const allOptions: Option[] = [
    ...defaultSettingsOptions,
    ...additionalOptions,
    { name: "Logout", action: handleLogout, icon: faSignOutAlt, className: "logout-button" },
  ];
function isActionOption(option: Option): option is ActionOption {
  return (option as ActionOption).action !== undefined;
}


  return (
    <div className="settings-page">
      <ul className="settingslist">
        {allOptions.map((option, index) => (
          <li
            key={index}
            className={`settingsitem ${option.className || ""}`} // Add conditional className
          >
           {isActionOption(option) ? (
  <button onClick={option.action} className="settingslink2">
    <div className="settinglinkSub">
      <FontAwesomeIcon icon={option.icon} className="settingsicon" />
      <span>{option.name}</span>
    </div>
  </button>
) : (
  <Link href={option.path} className="settingslink">
    <div className="settinglinkSub">
      <FontAwesomeIcon icon={option.icon} className="settingsicon" />
      <span>{option.name}</span>
    </div>
    <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
  </Link>
)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SetOptions;
