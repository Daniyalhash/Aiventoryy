import '@/styles/SignupPage.css';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const DatasetUpload = ({ userId, emailId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showPopup, setShowPopup] = useState(false);  // Popup state
  console.log("User ID :", userId);
  console.log("email ID :", emailId);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [firstVisit, setFirstVisit] = useState(true); // Track first visit
  const [isInfoHighlighted, setIsInfoHighlighted] = useState(true); // For glowing effect
  useEffect(() => {
    console.log("User ID in DatasetUpload:", userId);
  }, [userId]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    // Reset previous messages
    setMessage("");
    setIsError(false);
    // Validate file type

    // Get file size in MB
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2); // Convert to MB, limit to 2 decimal places
    const maxSizeMB = 15; // Set max file size limit (e.g., 5MB)

    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    const isValidType = validTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".csv");
    if (!isValidType) {
      setMessage("❌ Please upload a valid CSV file.");
      setIsError(true);
      setFile(null); // Clear invalid file
      return;
    }
    // selectedFile.name.endsWith('.csv');

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setMessage(`❌ File size (${fileSizeMB} MB) exceeds the ${maxSizeMB} MB limit.`);
      setIsError(true);
      setFile(null); // Clear invalid file
      return;
    }

    setFile(selectedFile);
    setFileName(`${selectedFile.name} (${fileSizeMB} MB)`);
    setUploadProgress(0);
    setMessage(`✅File ready for upload: ${selectedFile.name} (${fileSizeMB} MB)`);
  };
  useEffect(() => {
    console.log("User ID in DatasetUpload:", userId);
    
    // Show info popup on first visit
    if (firstVisit) {
      setShowInfoPopup(true);
      setFirstVisit(false);
    }
  }, [userId, firstVisit]);

  const handleSubmit = async () => {
    if (!file) {
      setMessage('Please upload a file.');
      setIsError(true);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsUploading(true);
    setMessage("Uploading your dataset...");
    setIsError(false);
    setUploadProgress(0); // Reset progress before upload starts

    const formData = new FormData();
    formData.append('dataset', file);
    formData.append("user_id", userId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/aiventory/upload_dataset/", true);
    let uploadTimeout = setTimeout(() => {
      xhr.abort();
      setMessage("Upload timed out. Please try again.");
      
      setIsError(true)
      setIsUploading(false);
      setUploadProgress(0);
    }, 300000); // 30s timeout
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };

    xhr.onload = () => {
      clearTimeout(uploadTimeout);
      setIsUploading(false);
      if (xhr.status === 200) {
        setMessage("Dataset uploaded successfully! Redirecting...");
        setIsError(false);
        setTimeout(() => {
          onUploadComplete({ user_id: JSON.parse(xhr.responseText).user_id });
          setMessage("");
          setUploadProgress(0); // Hide progress bar after upload
        }, 1000);
      } 
      else {
        setMessage("Upload failed. Please try again.");
        setIsError(true);
        setUploadProgress(0); // Hide progress bar if upload fails

      }

    };

    xhr.onerror = () => {
      clearTimeout(uploadTimeout);

      setMessage("Network error. Please try again.");
      setIsError(true);
      setIsUploading(false);
      setUploadProgress(0); // Hide progress bar on error
    };

    xhr.send(formData);
  };


  const clearFile = () => {
    setFile(null);
    setFileName("");
    setUploadProgress(0);
    setIsUploading(false); // Stop uploading when file is cleared

  };
  const handleDiscardChanges = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/aiventory/discard_signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailId }), // Replace with actual user email
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Signup discarded. Redirecting...");
        window.location.href = "/"; // Redirect to homepage or login
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
useEffect(() => {
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = ''; // This shows the native browser confirmation
  };

  const handlePopState = () => {
    // Show your custom popup
    setShowPopup(true);
    // Push back to prevent actual back navigation
    window.history.pushState(null, '', window.location.href);
  };

  // For browser refresh or tab close
  window.addEventListener('beforeunload', handleBeforeUnload);
  // For browser back button
  window.addEventListener('popstate', handlePopState);
  // Prevent default back navigation
  window.history.pushState(null, '', window.location.href);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('popstate', handlePopState);
  };
}, []);

  const handleSaveChanges = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/aiventory/in_complete_signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailId }), // Replace with actual user email
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Signup completed. Redirecting...");
        window.location.href = "/"; // Redirect to the main dashboard
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // Add this component just before the return statement
  const InfoPopup = () => (
    <>
    <div className="popupOverlay">
      <div className="popupContent" style={{ maxWidth: '800px' }}>
      <button className="popupClose" onClick={() => {
  setShowInfoPopup(false);
  setIsInfoHighlighted(false);
}}>
  <FontAwesomeIcon icon={faTimes} />
</button>
        <h3>How to Upload Your Data</h3>
        <div className="scrollableContent">
        <div className="uploadInstructions">
          <h4>Requirements:</h4>
          <ul>
            <li>File must be in CSV format</li>
            <li>Maximum file size: 6MB</li>
            <li>Required columns (case sensitive):</li>
          </ul>
          <div className="columnsList">
            <div className="columnDefinition">
              <div className="columnItem">
                <p>                <strong>productname</strong>: Name of the product (e.g., Organic Apples)
                </p>
              </div>
              <div className="columnItem">
                <p>                <strong>category</strong>: Main category (e.g., Fruits, Vegetables)
                </p>
              </div>
              <div className="columnItem">
                <p>                <strong>subcategory</strong>: Specific type (e.g., Apples, Leafy Greens)
                </p>
              </div>
              <div className="columnItem">
                <p>                <strong>stockquantity</strong>: Current inventory count (whole numbers only)
                </p>
              </div>
              <div className="columnItem">
                <p>                <strong>reorderthreshold</strong>: Minimum stock level before reordering
                </p>
              </div>
              <div className="columnItem">
                <p>                <strong>costprice</strong>: Your purchase price per unit (numeric)
                </p>
              </div>
              <div className="columnItem">
                <p>                <strong>sellingprice</strong>: Retail price per unit (numeric)
                </p>
              </div>
            </div>

            <div className="columnDefinition">
              <div className="columnItem">
                <p><strong>timespan</strong>: Date product arrived (MM/DD/YYYY format)</p>
              </div>
              <div className="columnItem">
                <p><strong>expirydate</strong>: Product expiry (YYYY-MM-DD format)</p>
              </div>
              <div className="columnItem">
                <p><strong>monthly_sales</strong>: Average units sold per month</p>
              </div>
              <div className="columnItem">
                <p><strong>DeliveryTime</strong>: Days to receive from supplier (1-10)</p>
              </div>
              <div className="columnItem">
                <p><strong>ReliabilityScore</strong>: Supplier rating (0-100 scale)</p>
              </div>
              <div className="columnItem">
                <p><strong>Barcode</strong>: Product identifier (12-13 digits)</p>
              </div>
              <div className="columnItem">
                <p><strong>vendor</strong>: Supplier company name</p>
              </div>
            </div>

            <div className="columnDefinition">
              <div className="columnItem">
                <p><strong>vendorPhone</strong>: Supplier contact number (with country code)</p>
              </div>
              <div className="columnItem">
                <p><strong>productSize</strong>: Unit measurement (kg, ml, g, L, etc.)</p>
              </div>
              <div className="columnItem">
                <p><strong>sale_date</strong>: Month of sales data (YYYY-MM format)</p>
              </div>
              <div className="columnItem">
                <p><strong>season</strong>: Current season (Spring, Summer, Fall, Winter)</p>
              </div>
            </div>

            <div className="importantNote">
              <h4>⚠️ Important Requirements:</h4>
              <ul>
                <li>All columns must be present with <strong>exact spelling</strong> as shown</li>
                <li>File must be <strong>UTF-8 encoded</strong></li>
                <li>No empty values in required fields</li>
                <li>Date formats must match exactly</li>
                <li>Numeric fields must contain only numbers</li>
                <li>Failure to meet these requirements will prevent dashboard creation</li>
              </ul>
            </div>
          </div>

          <h4>Example Data:</h4>
          <div className="sampleData">
            <table>
              <thead>
                <tr>
                  <th>productname</th>
                  <th>category</th>
                  <th>subcategory</th>
                  <th>stockquantity</th>
                  <th>reorderthreshold</th>
                  <th>costprice</th>
                  <th>sellingprice</th>
                  <th>timespan</th>
                  <th>expirydate</th>
                  <th>monthly_sales</th>
                  <th>DeliveryTime</th>
                  <th>ReliabilityScore</th>

                  <th>Barcode</th>
                  <th>vendor</th>
                  <th>vendorPhone</th>
                  <th>productSize</th>
                  <th>sale_date</th>

                  <th>season</th>

                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Onions</td>
                  <td>Vegetables</td>
                  <td>Onions</td>
                  <td>288</td>
                  <td>26</td>
                  <td>18.636</td>
                  <td>25.56</td>
                  <td>2024-03-01</td>
                  <td>2026-08-01</td>
                  <td>100</td>
                  <td>1</td>
                  <td>89</td>
                  <td>1234567890123</td>
                  <td>ABC Farms</td>
                  <td>+2876543210</td>
                  <td>2Kg</td>
                  <td>2024-08-01</td>
                  <td>Summer</td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
  return (
    <div className={`stepContainer ${showInfoPopup ? 'dimmed' : ''}`}>
      {/* Message Container - Same as Login Page */}
      <div className={`messageContainer ${message ? 'show' : ''} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>

      <div className="loginText">
        <h1 className="welcometext">Create your account</h1>
        <p className="subtext">Upload your store data</p>
      </div>

      <div className="fileUploadContainer">
        <label htmlFor="fileUpload" className="customFileButton">
          <FontAwesomeIcon icon={faUpload} className="upload-icon" />
          {file ? "Change File" : "Choose CSV File"}
        </label>
        <input
          type="file"
          id="fileUpload"
          onChange={handleFileUpload}
          accept=".csv"
          className="hiddenFileInput"
        />

        {fileName && (
          <div className="fileInfo">
            <span className={`fileName ${isError ? 'error' : 'valid'}`}>
              {fileName} {isError ? "❌" : "✅"}
            </span>
            <button onClick={clearFile} className="clearFileButton">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}
      </div>
      {isUploading && (
        <div className="progressSection">
          <div className="progressContainer">
            <div
              className="progressBar"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span className="progressText">{uploadProgress}%</span>
          </div>
        </div>
      )}


      <button
        onClick={handleSubmit}
        className="iconButton"
        disabled={isUploading || !file || isError} // Disable if file is invalid
      >
        {isUploading ? (
          <>
            <span className="button-spinner"></span>
            Uploading...
          </>
        ) : (
          "Submit CSV"
        )}
      </button>

      <div className="leaveInfo">
        <button
        className={`infoButton ${isInfoHighlighted && !showInfoPopup ? 'glow' : ''}`}
        onClick={() => {
          setShowInfoPopup(true);
          setIsInfoHighlighted(false);
        }}          title="Upload instructions"
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </button>
        {/* Leave Page Button */}
        <button className="leaveButton" onClick={() => setShowPopup(true)}>Leave Page</button>

      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popupOverlay">
          <div className="popupContent">
            <button className="popupClose" onClick={() => setShowPopup(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Are you sure you want to leave?</h3>
            <p>Your progress will be lost if you discard changes.</p>
            <div className="popupButtons">
              <button className="discardButton"
                onClick={handleDiscardChanges}

              >Discard Changes</button>
              <button className="saveButton"
                onClick={handleSaveChanges}
              >Save & Leave</button>
            </div>
          </div>
        </div>
      )}
      {/* New info popup */}
      {showInfoPopup && <InfoPopup />}
    </div>
  );
};

export default DatasetUpload;