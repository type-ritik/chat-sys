import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IndexPage from "./pages/IndexPage";

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
          <Route path="explore" element={<div>Welcome to Explore</div>} />
          <Route path="chat" element={<div>Welcome to Chat</div>} />
          <Route path="notification" element={<div>Welcome to Notification</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
