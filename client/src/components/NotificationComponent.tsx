import { useQuery } from "@apollo/client/react";
import { NOTIFICATION_LIST } from "../services/NotificationService";
import { useEffect, useState } from "react";

type NotificationItem = {
  sender: {
    username: string;
  };
  content: string;
  timestamp: string | number;
};

type NotificationQueryData = {
  retrieveNotification: NotificationItem[];
};

function NotificationComponent() {
  const { loading, error, data } =
    useQuery<NotificationQueryData>(NOTIFICATION_LIST);
  const [notificationData, setNotificationData] = useState<
    NotificationQueryData["retrieveNotification"] | null
  >(null);
  const [notificationLength, setNotificationLength] = useState<number | null>(null);

  useEffect(() => {
    if (loading) console.log("Query is loading...");
    if (error) console.log("Query Error", error);
    if (data) {
      console.log("Query data:", data.retrieveNotification);
      setNotificationLength(data.retrieveNotification.length);
      setNotificationData(data.retrieveNotification);
    }
  }, [data, loading, error]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 py-6">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-gray-700 tracking-tight">
        Notifications
      </h1>

      {/* Notifications List */}
      {notificationData && notificationLength !== 0 ? (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {(notificationData as NotificationItem[]).map((item: NotificationItem, index: number) => (
            <div
              key={index}
              className="flex gap-4 w-full bg-white p-4 rounded-xl items-center
                 shadow-sm hover:shadow-md hover:scale-[1.01]
                 border border-gray-100 transition-all duration-300 ease-in-out"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
          <img
            src={
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0"
            }
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-purple-400 object-cover"
          />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            {item.sender.username}
          </h3>
          <p className="text-sm text-gray-600 leading-snug">
            {item.content}
          </p>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-xs text-gray-500">
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 text-gray-500 text-sm">
          No new notifications 📭
        </div>
      )}
    </div>
  );
}

export default NotificationComponent;
