import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IndexPage from "./pages/IndexPage";
import ChatRoomComponent from "./components/ChatRoomComponent";
import ExploreFriendComponent from "./components/ExploreFriendComponent";
import NotificationComponent from "./components/NotificationComponent";
import FriendsComponent from "./components/FriendsComponent";
import ChatComponent from "./components/ChatComponent";
import ProfileComponent from "./components/ProfileComponent";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<IndexPage />}>
          {/* Nested rotues inside Indexpage */}

          <Route index element={<div>Welcome to ChatSys!</div>} />
          <Route path="profile" element={<ProfileComponent />} />
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
