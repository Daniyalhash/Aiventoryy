// components/SettingOver.tsx
import '../src/styles/InvoiceOver.css';
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
 
  faChevronLeft,
 
} from "@fortawesome/free-solid-svg-icons";
export default function InvoiceOver() {
  return (
    <section className="Invoicesection">
        {/* Back to Settings Link */}
        <Link href={"/dashboard/setting"} className="Backsettings">
        <FontAwesomeIcon icon={faChevronLeft} className="EPicon" />
        <span>Settings</span>
      </Link>
      <h2 className="InvoicesecHead">Invoice Center</h2>
      <p className="InvoicesecSubhead">Manage system incoming invoices from external vendors</p>
    </section>
  );
}
