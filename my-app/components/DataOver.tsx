import '@/styles/EditProfileOver2.css';


import "@/styles/NotificationsOver.css";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChevronLeft,
  faEdit,
  faCamera,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
export default function EditProfileOver() {
  return (
    <section className="EditProfileOversection">
        {/* Back to Settings Link */}
        <Link href={"/dashboard/setting"} className="Backsettings">
        <FontAwesomeIcon icon={faChevronLeft} className="EPicon" />
        <span>Settings</span>
      </Link>
      <h2 className="EditProfileOversecHead">Data Center</h2>
      <p className="EditProfileOversecSubhead">Upload and save your Data to up to date with trends</p>
    </section>
  );
}
