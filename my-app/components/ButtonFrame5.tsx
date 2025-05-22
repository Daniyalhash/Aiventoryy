import { useState } from "react";
import Button from "@/components/Button";
import {
  faPlus,  faMagnifyingGlass,
  faTrashAlt,
  faRotate,
  faFileExport
} from "@fortawesome/free-solid-svg-icons";
import '@/styles/buttonFrame2.css';
import Popup2 from '@/components/Popup2'; // Import the Popup component
import SimpleForm from "./addFormP";
import DelForm from "./DelFormP";
import UpdateForm from "./UpdateFormP";
import SearchForm from "./SearchFormP";
import ExportProductFile from "./ExportProductFile";
import ActivityProduct from "./ActivityProduct";

const  ButtonFrame5 = () => {



//

  // fetching just categories using SWR


  const [popupConfig, setPopupConfig] = useState({
    isOpen: false,
    head: '', // Main heading
    title: '', // Subheading
    content: null, // Dynamic content
  });
  // Function to open the popup
  const openPopup = (head, title, content, size = "large") => {
    setPopupConfig({
      isOpen: true,
      head,
      title,
      size,
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
      size: '',
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
 const activityLogs = (
  <ActivityProduct />
  );
   const exportProduct = (
  <ExportProductFile />
  );
  const buttonData = [
    {
      id: 1,
      text: "Add a Product",
      icon: faPlus,
      onClick: () => openPopup("Product Management", "Add a Product", addVendorContent),
    },
    {
      id: 2,
      text: "Delete a Product",
      icon: faTrashAlt,
      onClick: () => openPopup("Product Management", "Delete a Product", deleteVendorContent),
    },
    {
      id: 3,
      text: "Update a Product",
      icon: faRotate,
      onClick: () => openPopup("Product Management", "Update a Product", updateVendorContent),
    },
    {
      id: 4,
      text: "Search a Product",
      icon: faMagnifyingGlass,
      onClick: () => openPopup("Product Management", "Search a Product", searchVendorContent),
    },
     {
      id: 5,
      text: "Export CSV",
      icon: faFileExport,
      onClick: () => openPopup("Product Management", "Export CSV", exportProduct),
    }, {
      id: 6,
      text: "Logs",
      icon: faRotate,
      onClick: () => openPopup("Product Management", "Activity Logs", activityLogs),
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
       <Popup2
       head={popupConfig.head}
       title={popupConfig.title}
       size={popupConfig.size}  // <--- now dynamic
       content={popupConfig.content}
       onClose={closePopup}
     />
     
      )}
    </>

  );
};

export default ButtonFrame5;
