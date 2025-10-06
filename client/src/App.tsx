import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IndexPage from "./pages/IndexPage";
import ChatRoomComponent from "./components/ChatRoomComponent";
import ExploreFriendComponent from "./components/ExploreFriendComponent";
import { CHATMSG_SUBS, NOTIFICATION_SUBSCRIPTION } from "./config";
import { useEffect, useState } from "react";
import { useSubscription } from "@apollo/client/react";
import NotificationComponent from "./components/NotificationComponent";
import FriendsComponent from "./components/FriendsComponent";
import ChatComponent from "./components/ChatComponent";

// ChatMsg Data Type
type ChatMsgSubsData = {
  chatMsg: {
    id: string;
    userId: string;
    message: string;
    chatRoomId: string;
    createdAt: string;
  };
};

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

  const [chatMsgState, setChatMsgState] = useState<
    ChatMsgSubsData["chatMsg"] | null
  >(null);

  const { data, loading, error } =
    useSubscription<NotificationSubscriptionData>(NOTIFICATION_SUBSCRIPTION, {
      variables: { userId: window.localStorage.getItem("userId") },
    });

  const {
    data: chatMsgData,
    loading: chatMsgLoading,
    error: chatMsgError,
  } = useSubscription<ChatMsgSubsData>(CHATMSG_SUBS, {
    variables: { userId: window.localStorage.getItem("userId") },
  });

  useEffect(() => {
    if (loading) console.log("Notification Subscription loading...");
    if (error) console.log("Notification Subscription error:", error);
    if (data) {
      console.log("Notification Subscription active, new data:", data);
      setNotificationData(data.subNotify);
    }
  }, [data, error, loading]);

  useEffect(() => {
    if (chatMsgLoading) console.log("ChatMsg Subscription loading...");
    if (chatMsgError) console.log("ChatMsg Subscription error:", chatMsgError);
    if (chatMsgData) {
      console.log("ChatMsg Subscription active, new data:", chatMsgData);
      setChatMsgState(chatMsgData.chatMsg);
    }
  }, [chatMsgData, chatMsgLoading, chatMsgError]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <IndexPage
              notify={notificationData ? true : false}
              chatify={chatMsgState ? true : false}
            />
          }
        >
          {/* Nested rotues inside Indexpage */}
          <Route index element={<div>Welcome to ChatSys!</div>} />
          <Route path="profile" element={<div>Welcome to Profile</div>} />
          <Route path="explore" element={<ExploreFriendComponent />} />
          <Route path="chat" element={<ChatRoomComponent />} />
          <Route path="notification" element={<NotificationComponent />} />
          <Route path="friends/chat/:id" element={<ChatComponent />} />
          <Route path="friends" element={<FriendsComponent />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
