
import UserProfileCard from '@/components/UserProfileCard';

import "@/styles/EditProfileOver.css";

const EditProfilePage = () => {
  const userId = localStorage.getItem("userId");
  
  return (
    <div className="page-container">
      <UserProfileCard userId={userId} />
    </div>
  );
};

export default EditProfilePage;