import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IndexPage from "./pages/IndexPage";
import ChatRoomComponent from "./components/ChatRoomComponent";
import ExploreFriendComponent from "./components/ExploreFriendComponent";
import { NOTIFICATION_SUBSCRIPTION } from "./config";
import { useEffect, useState } from "react";
import { useSubscription } from "@apollo/client/react";
import NotificationComponent from "./components/NotificationComponent";

// Notification Data Type
type NotificationSubscriptionData = {
  subNotify: {
    id: string;
    content: string;
    isSeen: boolean;
    requestedId: string;
    sender: {
      username: string;
      name: string;
    };
    receiver: {
      username: string;
      name: string;
    };
    receiverId: string;
    senderId: string;
    timestamp: string;
  };
};

function App() {
  const [notificationData, setNotificationData] = useState<
    NotificationSubscriptionData["subNotify"] | null
  >(null);

  const { data, loading, error } =
    useSubscription<NotificationSubscriptionData>(NOTIFICATION_SUBSCRIPTION, {
      variables: { userId: window.localStorage.getItem("userId") },
    });

  useEffect(() => {
    if (loading) console.log("Subscription loading...");
    if (error) console.log("Subscription error:", error);
    if (data) {
      console.log("Subscription active, new data:", data);
      setNotificationData(data.subNotify);
    }
  }, [data, error, loading]);

  if (loading) {
    console.log("Loading");
  }
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<IndexPage notify={notificationData ? (true) : (false)} />}>
          {/* Nested rotues inside Indexpage */}
          <Route index element={<div>Welcome to ChatSys!</div>} />
          <Route path="profile" element={<div>Welcome to Profile</div>} />
          <Route path="explore" element={<ExploreFriendComponent />} />
          <Route path="chat" element={<ChatRoomComponent />} />
          <Route path="notification" element={<NotificationComponent />} />
          <Route path="chat/:id" element={<div>Welcome to ChatById</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
