import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const FeatureGuide = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Match this with CSS transition duration
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]); // Now properly included in dependencies
  // useEffect(() => {
  //   // Trigger animation after component mounts
  //   const timer = setTimeout(() => setIsVisible(true), 10);
  //   return () => clearTimeout(timer);
  // }, []);

  // Handle click outside
  const handleClickOutside = useCallback((e) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target)) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Trigger animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`feature-guide-overlay ${isVisible ? 'active' : ''}`}
      ref={overlayRef}
    >      <div className="feature-guide-container">
        <div className="feature-guide-header">
          <img src="/images/logoPro.png" alt="Aiventory Logo" className="feature-guide-logo" />
          <button
            className="feature-guide-close"
            onClick={handleClose}
            aria-label="Close feature guide"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* <Link href="/dashboard/setting/notifications">
            <div className="bellIcon">
              <FontAwesomeIcon icon={faBell} className="Iconbell" />
            </div>
          </Link> */}



        <div className="feature-guide-content">

          <h2>Welcome to Aiventory!</h2>
          <p>Here's what you can do with our inventory management system:</p>

          <div className="feature-section">
            <Link href="/dashboard">

              <h3>📊 <span className="highlight">Dashboard</span></h3>
            </Link>

            <ul>
              <li>Overview of stock levels</li>
              <li>Expiring products tracking</li>
              <li>Vendor performance summary</li>
              <li>Total products count</li>
            </ul>
          </div>

          <div className="feature-section">
            <Link href="/dashboard/inventory">

              <h3>📊 <span className="highlight">Inventory Management</span></h3>
            </Link>
            <ul>
              <li>Create, Read, Update, Delete products</li>
              <li>Inventory dashboard with key metrics</li>
            </ul>
          </div>

          <div className="feature-section">
          <Link href="/dashboard/vendor">

            <h3>🤝 <span className="highlight">Vendor Management</span></h3>
</Link>
            <ul>
              <li>Manage all your vendors</li>
              <li>Vendor performance dashboard</li>
              <li>CRUD operations for vendors</li>
            </ul>
          </div>

          <div className="feature-section">
          <Link href="/dashboard/insights">

            <h3>🔍 <span className="highlight">Insights & Analytics</span></h3>
            </Link>
            <ul>
              <li>Product benchmarking by category</li>
              <li>Cost and profit margin comparisons</li>
              <li>Vendor performance analysis</li>
              <li>Low stock alerts with recommendations</li>
              <li>Direct invoice sending to vendors</li>
            </ul>
          </div>

          <div className="feature-section">
          <Link href="/dashboard/future">

            <h3>📈 <span className="highlight">Forecasting</span></h3>
            </Link>
            <ul>
              <li>Sales predictions for next month</li>
              <li>Stock level suggestions</li>
              <li>Historical sales analysis</li>
            </ul>
          </div>

          <div className="feature-section">
          <Link href="/dashboard/setting">

            <h3>⚙️ <span className="highlight">Settings</span></h3>
            </Link>
            <ul>
              <li>Edit your profile (name, email)</li>
              <li>Configure notification preferences</li>
            </ul>
          </div>

          <div className="feature-section">
          <Link href="/dashboard/setting/notifications">

            <h3>🔔 <span className="highlight">Notifications</span></h3>
            </Link>
            <ul>
              <li>Expiry alerts (30-day warning)</li>
              <li>Expired product notifications</li>
              <li>Low stock alerts</li>
            </ul>
          </div>

          <div className="feature-section">
          <Link href="/dashboard/setting/invoice">

            <h3>🧾 <span className="highlight">Invoice Management</span></h3>
            
            </Link>
            <ul>
              <li>Create and send invoices to vendors</li>
              <li>Direct WhatsApp integration</li>
              <li>Vendor-specific invoice history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FeatureGuide;