// components/NotificationsContent.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCircleXmark,
  faTrash,

  faTimes,
  faCheckSquare,
  faSquare,
  faBoxOpen,
  faExclamation,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import useSWR, { mutate } from "swr";
import { fetchStockNoti, fetchNotifications, deleteNotifications, markNotificationAsRead } from "@/utils/api";
import "@/styles/NotificationsContent.css";

interface Notification {
  _id: string;
  type: "out-of-stock" | "low-stock" | "expiring" | "recommendation";
  message: string;
  created_at: string; // Assuming this field exists for timestamps
  count: number;
  read: boolean;
  productIds?: string[];
}

export default function NotificationsContent() {
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Fetch notifications with a shorter refresh interval (3 seconds for testing)
  const { data: notifications, error } = useSWR<Notification[]>(
    userId ? ["get-notifications", userId] : null,
    () => fetchNotifications(userId),
    {
      revalidateOnFocus: true,
      refreshInterval: 300000, // Refresh every 3 seconds (adjust to 300000ms for production)
      shouldRetryOnError: false,
    }
  );

  // Trigger stock level check and notification generation on component mount
  useEffect(() => {
    if (userId) {
      const triggerStockCheck = async () => {
        try {
         

          // Call the API to check stock levels and generate notifications
          await fetchStockNoti(userId);

          // Revalidate the SWR cache to fetch updated notifications
          mutate(["get-notifications", userId]);

      
        } catch (error) {
          setMessage("Failed to check stock levels");
          setIsError(true);
          console.error("Failed to check stock levels:", error);
        }
      };

      triggerStockCheck();
    }
  }, [userId]);

  // Calculate unread count
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  // Toggle delete mode
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    if (!deleteMode) setSelectedNotifications([]);
  };

  // Toggle select all notifications
  const toggleSelectAll = () => {
    if (notifications) {
      if (selectedNotifications.length === notifications.length) {
        setSelectedNotifications([]);
      } else {
        setSelectedNotifications(notifications.map((n) => n._id));
      }
    }
  };

  // Toggle single notification selection
  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedNotifications.length === 0 || !userId) {
      setMessage("Please select notifications to delete");
      setIsError(true);
      return;
    }

    try {
      setMessage("Deleting notifications...");
      setIsError(false);

      await deleteNotifications(userId, selectedNotifications);
      mutate(["get-notifications", userId]);
      setSelectedNotifications([]);
      setDeleteMode(false);

      setMessage("Notifications deleted successfully");
      setIsError(false);
    } catch (error) {
      setMessage("Failed to delete notifications");
      setIsError(true);
      console.error("Failed to delete notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (!userId) return;

    try {
      // You'll need to implement this API endpoint
      await markNotificationAsRead(userId, id);
      mutate(["get-notifications", userId]);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Format time in 12-hour format with AM/PM (convert UTC to local time)
  const formatTime = (utcDateString: string) => {
    const utcDate = new Date(utcDateString);

    if (isNaN(utcDate.getTime())) {
      console.error("Invalid date string:", utcDateString);
      return "Invalid time";
    }

    // Convert UTC to local time using the user's system timezone
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the user's local timezone
    };

    return utcDate.toLocaleTimeString("en-PK", options); // Use "en-PK" for Pakistani formatting
  };

  // Format date in DD/MM/YYYY format (convert UTC to local time)
  const formatDate = (utcDateString: string) => {
    const utcDate = new Date(utcDateString);

    if (isNaN(utcDate.getTime())) {
      console.error("Invalid date string:", utcDateString);
      return "Invalid date";
    }

    // Convert UTC to local time using the user's system timezone
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the user's local timezone
    };

    return utcDate.toLocaleDateString("en-PK", options); // Use "en-PK" for Pakistani formatting
  };

  // Get icon by notification type
  const getIconByType = (type: string) => {
    switch (type) {
      case "out-of-stock":
        return faBoxOpen;
      case "low-stock":
        return faExclamation;
      case "expiring":
        return faClock;
      default:
        return faTriangleExclamation;
    }
  };

  if (error) return <div className="notifications-error">Failed to load notifications</div>;
  if (!notifications) return <div className="notifications-loading">Loading notifications...</div>;
  if (notifications.length === 0) return <div className="notifications-empty">No notifications</div>;

  return (
    <section className="notifications-section">
      {/* Message container for feedback */}
      <div className={`messageContainer ${message ? "show" : "hide"} ${isError ? "error" : "success"}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>
            ✖
          </span>
          {message}
        </div>
      </div>

      {/* Notifications header */}
      <div className="notifications-header">
        <h2 className="notifications-title">
          Notifications{" "}
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h2>
        <div className="notifications-actions">
          {deleteMode ? (
            <>
              {/* Select All Button */}
              <button onClick={toggleSelectAll} className="action-button">
                <FontAwesomeIcon
                  icon={selectedNotifications.length === notifications.length ? faCheckSquare : faSquare}
                  className="select-icon"
                />
                {selectedNotifications.length === notifications.length ? "Unselect All" : "Select All"}
              </button>

              {/* Delete Selected Button */}
              <button
                onClick={deleteSelected}
                className="action-button delete"
                disabled={selectedNotifications.length === 0}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete ({selectedNotifications.length})
              </button>

              {/* Cancel Button */}
              <button onClick={toggleDeleteMode} className="action-button cancel">
                <FontAwesomeIcon icon={faTimes} />
                Cancel
              </button>
            </>
          ) : (
            // Manage Notifications Button
            <button onClick={toggleDeleteMode} className="action-button delete">
              <FontAwesomeIcon icon={faTrash} />
              Manage Notifications
            </button>
          )}
        </div>
      </div>

      {/* Notifications container */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`notification-box ${
              selectedNotifications.includes(notification._id) ? "selected" : ""
            } ${!notification.read ? "unread" : ""}`}
            onClick={() => !deleteMode && markAsRead(notification._id)}
          >
            {/* Checkbox for delete mode */}
            {deleteMode && (
              <div className="notification-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification._id)}
                  onChange={() => toggleSelectNotification(notification._id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Notification icon */}
            <div className="notification-icon">
              <FontAwesomeIcon
                icon={getIconByType(notification.type)}
                className={`alert-icon ${notification.type}`}
              />
            </div>

            {/* Notification content */}
            <div className="notification-content">
              <h3 className="notification-message">{notification.message}</h3>
              <div className="notification-meta">
                <span className="notification-time">
                  {formatDate(notification.created_at)} at {formatTime(notification.created_at)}
                </span>
                <Link
                  href={{
                    pathname: "/dashboard/insights",
                    query: {
                      filter: notification.type,
                      productIds: notification.productIds?.join(","),
                    },
                  }}
                  className="details-link"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Close button for individual notifications */}
            {!deleteMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelectNotification(notification._id);
                  deleteSelected();
                }}
                className="close-notification"
              >
                <FontAwesomeIcon icon={faCircleXmark} />
              </button>
            )}
          </div>
        ))}
      </div>




      
    </section>




  );
}