

import React, { useState,useRef } from 'react';
import Button from "@/components/Button";
import {
  faPlus,  faMagnifyingGlass,
  faTrashAlt,
  faRotate
} from "@fortawesome/free-solid-svg-icons"; import '@/styles/buttonFrame.css';
import Popup from '@/components/Popup'; // Import the Popup component
import axios from "axios";
// import { Barcode } from 'lucide-react';

const ButtonFrame2 = () => {
   // Create refs for each input field
 const formRef = useRef({
  vendor_name: React.createRef<HTMLInputElement>(),
  reliability_score: React.createRef<HTMLInputElement>(),
  delivery_time: React.createRef<HTMLInputElement>(),
  vendor_phone: React.createRef<HTMLInputElement>(),
  category: React.createRef<HTMLInputElement>(),
  product_barcode: React.createRef<HTMLInputElement>()
});
const vendorNameRef = useRef<HTMLInputElement>(null);
const reliabilityScoreRef = useRef<HTMLInputElement>(null);
const deliveryTimeRef = useRef<HTMLInputElement>(null);
const vendorPhoneRef = useRef<HTMLInputElement>(null);
const categoryRef = useRef<HTMLInputElement>(null);
const productBarcodeRef = useRef<HTMLInputElement>(null);

  // Debugging: See updates in real-time

  const [popupConfig, setPopupConfig] = useState<{
    isOpen: boolean;
    head: string;
    title: string;
    content: React.ReactNode | null;
  }>({
    isOpen: false,
    head: '', // Main heading
    title: '', // Subheading
    content: null, // Dynamic content
  });
  // Function to open the popup
  const openPopup = (head: string, title: string, content: React.ReactNode) => {
    setPopupConfig({
      isOpen: true,
      head,
      title,
      content,
    });
  };
  // Function to close the popup
  const closePopup = () => {
    setPopupConfig({
      isOpen: false,
      head: '',
      title: '',
      content: null,
    });
  };
  // Handle Input Change
  // Handle Input Change


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

   // Get all form values from refs
const formData = {
  vendor_name: vendorNameRef.current?.value || '',
  reliability_score: reliabilityScoreRef.current?.value || '',
  delivery_time: deliveryTimeRef.current?.value || '',
  vendor_phone: vendorPhoneRef.current?.value || '',
  category: categoryRef.current?.value || '',
  product_barcode: productBarcodeRef.current?.value || '',
};


  console.log("Submitting:", formData);

   
  if (!formData.vendor_name || !formData.vendor_phone) {
    alert("Please fill out all required fields.");
    return;
  }

  try {
    // const response = await axios.post("http://127.0.0.1:8000/aiventory/add-vendor/", formData);

    const response = await axios.post("https://seal-app-8m3g5.ondigitalocean.app/aiventory/-vendor/", formData);
    console.log("Response:", response.data);
    alert(`Vendor ${formData.vendor_name} added successfully!`);
    
    // Clear all form fields
    Object.values(formRef.current).forEach(ref => {
      vendorNameRef.current!.value = '';
reliabilityScoreRef.current!.value = '';
deliveryTimeRef.current!.value = '';
vendorPhoneRef.current!.value = '';
categoryRef.current!.value = '';
productBarcodeRef.current!.value = '';

    });
    
    closePopup();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to add vendor. Please try again.");
  }
};
  // Static Form Fields
  const addVendorContent = (
    <div>
      <h3>Add a Vendor</h3>
      <form onSubmit={handleSubmit}> {/* Moved onSubmit here */}

        <div>
          <label>Vendor Name:</label>
          <input 
            type="text" 
            name="vendor_name" 
            ref={vendorNameRef} 
            defaultValue="" 
          />
        </div>
        <div>
          <label>Reliability Score:</label>
          <input 
            type="number"
            name="reliability_score"
            ref={reliabilityScoreRef}
            defaultValue=""
          />
        </div>
        <div>
          <label>Delivery Time:</label>
          <input 
            type="text"
            name="delivery_time"
            ref={deliveryTimeRef}
            defaultValue=""
          />
        </div>
        <div>
          <label>Vendor Phone:</label>
          <input 
            type="text"
            name="vendor_phone"
            ref={vendorPhoneRef}
            defaultValue=""
          />
        </div>
        <div>
          <label>Category:</label>
          <input 
            type="text"
            name="category"
            ref={categoryRef}
            defaultValue=""
          />
        </div>
        <div>
          <label>Product Barcode:</label>
          <input 
            type="text"
            name="product_barcode"
            ref={productBarcodeRef}
            defaultValue=""
          />
        </div>
        <button type="submit">Confirm</button> {/* Changed to type="submit" */}
      </form>

    </div>
  );
  const deleteVendorContent = (
    <div>
      <h3>Delete a Vendor</h3>
      {/* Add your delete confirmation or input fields here */}
    </div>
  );

  const updateVendorContent = (
    <div>
      <h3>Update a Vendor</h3>
      {/* Add your update form or input fields here */}
    </div>
  );
  const searchVendorContent = (
    <div>
      <h3>Search a Vendor</h3>
      {/* Add your update form or input fields here */}
    </div>
  );
  const buttonData = [
    {
      id: 1,
      text: "Add a Vendor",
      icon: faPlus,
      onClick: () => openPopup("Vendor Management", "Add a Vendor", addVendorContent),
    },
    {
      id: 2,
      text: "Delete a Vendor",
      icon: faTrashAlt,
      onClick: () => openPopup("Vendor Management", "Delete a Vendor", deleteVendorContent),
    },
    {
      id: 3,
      text: "Update a Vendor",
      icon: faRotate,
      onClick: () => openPopup("Vendor Management", "Update a Vendor", updateVendorContent),
    },
    {
      id: 4,
      text: "Search a Vendor",
      icon: faMagnifyingGlass,
      onClick: () => openPopup("Vendor Management", "Search a Vendor", searchVendorContent),
    },
  ];
  return (
    <>

      <div className="buttonContainer">
        {buttonData.map((button) => (
          <Button
            key={button.id}
            text={button.text}
            icon={button.icon}
            onClick={button.onClick} // Pass the onClick handler

          />
        ))}
      </div>

      {/* Render the Popup if isPopupOpen is true */}
      {popupConfig.isOpen && (
        <Popup
          head={popupConfig.head}

          title={popupConfig.title}
          content={popupConfig.content}
          onClose={closePopup}
        />
      )}
    </>

  );
};

export default ButtonFrame2;