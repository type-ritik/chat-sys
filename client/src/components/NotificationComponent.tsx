import { useQuery } from "@apollo/client/react";
import { NOTIFICATION_LIST } from "../services/NotificationService";
import { useEffect, useState } from "react";

type NotificationItem = {
  sender: {
    username: string;
    profile: {
      avatarUrl: string;
    };
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
  const [notificationLength, setNotificationLength] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (loading) console.log("Query is loading...");
    if (error) console.log("Query Error", error);
    if (data) {
      // console.log("Query data:", data.retrieveNotification);
      setNotificationLength(data.retrieveNotification.length);
      setNotificationData(data.retrieveNotification);
    }
  }, [data, loading, error]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 absolute right-0 top-0 overflow-y-scroll py-6 transition-discrete duration-300 ease-in-out">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-gray-700 tracking-tight">
        Notifications
      </h1>

      {/* Notifications List */}
      {notificationData && notificationLength !== 0 ? (
        <div className="w-full px-2 max-w-2xl flex flex-col gap-4">
          {(notificationData as NotificationItem[]).map(
            (item: NotificationItem, index: number) => (
              <div
                key={index}
                className="flex gap-4 w-full bg-white p-4 not-md:py-2 not-md:px-2 rounded-xl items-center
                 shadow-sm hover:shadow-md hover:scale-[1.01]
                 border border-gray-100 transition-all duration-300 ease-in-out"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={item.sender.profile.avatarUrl}
                    alt="Profile"
                    className="not-md:w-11 not-md:h-11 w-12 h-12 rounded-full border-2 border-purple-400 object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-base not-md:text-[13px] capitalize font-bold text-gray-900">
                    {item.sender.username}
                  </h3>
                  <p className="text-sm not-md:text-[11px] capitalize text-gray-600 leading-snug">
                    {item.content}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-sm not-md:text-[10px] text-gray-600">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ),
          )}
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
