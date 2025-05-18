
import "@/styles/UseAvatar.css";

const UserAvatar = ({ name, size = 'medium' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : 'A';
    const sizeClass = `user-avatar-${size}`;
    const hue = (initial.charCodeAt(0) * 5) % 360;
    const color = `hsl(${hue}, 70%, 60%)`;
    
    return (
      <div 
        className={`user-avatar ${sizeClass}`}
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
    );
  };
  export default UserAvatar;