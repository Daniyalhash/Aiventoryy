
import DataCard from '@/components/DataCard';

import "@/styles/EditProfileOver.css";

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