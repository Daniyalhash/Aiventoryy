import { useState } from "react";
import Button from "@/components/Button";
import {
  faPlus, faMagnifyingGlass,
   faTrashAlt,
  faRotate,
  faFileExport
} from "@fortawesome/free-solid-svg-icons";
import '@/styles/buttonFrame2.css';
import Popup from '@/components/Popup'; // Import the Popup component
import SimpleForm from "./addFormV";
import DelForm from "./DelFormV";
import UpdateForm from "./UpdateFormV";
import SearchForm from "./SearchFormV";
import ExportVendorFile from "./ExportVendorFile";
import ActivityVendor from "./ActivityVendor";

const  ButtonFrame = () => {



//

  // fetching just categories using SWR


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
  // Inside ButtonFrame component, replace addVendorContent with this:

  // Content for each popup
  const addVendorContent = (
    <SimpleForm />
   
  );

  const deleteVendorContent = (
   <DelForm />
  );

  const updateVendorContent = (
   <UpdateForm />
  );

  const searchVendorContent = (
  <SearchForm />
  );
 const exportCSV = (
  <ExportVendorFile />
  );

   const activityLogs = (
  <ActivityVendor />
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
    {
      id: 5,
      text: "Export CSV",
      icon: faFileExport,
      onClick: () => openPopup("Vendor Management", "Export CSV", exportCSV),
    },
    {
      id: 6,
      text: "Logs",
      icon: faRotate,
      onClick: () => openPopup("Vendor Management", "Activity Logs", activityLogs),
    },
  ];

  return (
    <>

      <div className="buttonContainerC">
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

export default ButtonFrame;
