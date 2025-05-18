
import DataCard from '@/components/DataCard';
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
const EditDataPage = () => {
    const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
    const email = typeof window !== "undefined" ? localStorage.getItem('email') : null;

  return (
    <div className="page-container">
      <DataCard userId={userId} email={email} />
    </div>
  );
};

export default EditDataPage;