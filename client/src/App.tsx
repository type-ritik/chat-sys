import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IndexPage from "./pages/IndexPage";
import ChatRoomComponent from "./components/ChatRoomComponent";
import ExploreFriendComponent from "./components/ExploreFriendComponent";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<IndexPage />}>
          {/* Nested rotues inside Indexpage */}
          <Route index element={<div>Welcome to ChatSys!</div>} />
          <Route path="profile" element={<div>Welcome to Profile</div>} />
          <Route path="explore" element={<ExploreFriendComponent />} />
          <Route path="chat" element={<ChatRoomComponent />} />
          <Route
            path="notification"
            element={<div>Welcome to Notification</div>}
          />
          <Route path="chat/:id" element={<div>Welcome to ChatById</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
