'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faUsers, faCogs } from '@fortawesome/free-solid-svg-icons';
import ProfileButton from './ProfileButton';
import '../src/styles/navbar.css';
import Image from 'next/image';
const Navbar = () => {
  const pathname = usePathname();
  // Check if current path starts with '/dashboard/setting'
  const isSettingsActive = pathname.startsWith('/dashboard/setting');

  return (
    <nav className="navbar">
      <div className="logo">
        <Image 
        src="/images/logoPro.png" 
        alt="Logo" 
        className="logImg" 
        width={0}
          height={0}
          sizes="100vw"
          style={{
            width: 'auto',
            height: 'auto',
          }}
          priority 
          
        />
      </div>
      <div className="menu">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
          <FontAwesomeIcon icon={faHome} className="iconDas" />
          Dashboard
        </Link>
        <Link href="/dashboard/inventory" className={pathname === '/dashboard/inventory' ? 'active' : ''}>
          <FontAwesomeIcon icon={faClipboardList} className="iconDas" />
          Inventory
        </Link>
     
        <Link href="/dashboard/vendor" className={pathname === '/dashboard/vendor' ? 'active' : ''}>
          <FontAwesomeIcon icon={faUsers} className="iconDas" />
          Vendor
        </Link>
        <Link href="/dashboard/insights" className={pathname === '/dashboard/insights' ? 'active' : ''}>
          <FontAwesomeIcon icon={faUsers} className="iconDas" />
          Insights
        </Link>
    
        <Link href="/dashboard/future" className={pathname === '/dashboard/future' ? 'active' : ''}>
          <FontAwesomeIcon icon={faUsers} className="iconDas" />
          Future
        </Link>
        <Link href="/dashboard/setting" className={isSettingsActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faCogs} className="iconDas" />
          Settings
        </Link>
      </div>
      <ProfileButton />
    </nav>
  );
};

export default Navbar;

// npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
