import { Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import { updateCurrentUser, type userObj } from "../redux/user/userSlice";
import { CHATMSG_SUBS, NOTIFICATION_SUBSCRIPTION } from "../config";
import { useEffect, useState } from "react";
import { useQuery, useSubscription } from "@apollo/client/react";
import { useDispatch, useSelector } from "react-redux";
import { USER_DATA } from "../services/ProfileService";

const navLink = [
  { label: "Home", route: "/" },
  { label: "Profile", route: "/profile" },
  { label: "Explore", route: "/explore" },
  { label: "Chat", route: "/chat" },
  { label: "Notification", route: "/notification" },
  { label: "Friends", route: "/friends" },
];

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

interface UserInterface {
  user: {
    currentUser: userObj;
    error: string;
    loading: boolean;
  };
}

interface UserData {
  userData: {
    id: string;
    name: string;
    isAdmin: boolean;
    username: string;
    profile: {
      id: string;
      bio: string;
      avatarUrl: string;
      isActive: boolean;
    };
  };
}

function IndexPage() {
  const { currentUser } = useSelector((state: UserInterface) => state.user);
  const [notify, setNotificationData] = useState<
    NotificationSubscriptionData["subNotify"] | null
  >(null);

  const {
    error: userError,
    data: userData,
    loading: userLoading,
  } = useQuery<UserData | null>(USER_DATA);

  const navigate = useNavigate();

  const [chatify, setChatMsgState] = useState<
    ChatMsgSubsData["chatMsg"] | null
  >(null);

  const { data, loading, error } =
    useSubscription<NotificationSubscriptionData>(NOTIFICATION_SUBSCRIPTION, {
      variables: { userId: currentUser ? currentUser.id : navigate("/signup") },
    });

  const {
    data: chatMsgData,
    loading: chatMsgLoading,
    error: chatMsgError,
  } = useSubscription<ChatMsgSubsData>(CHATMSG_SUBS, {
    variables: { userId: currentUser ? currentUser.id : navigate("/signup") },
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (userLoading) console.log("User data loading...");
    if (userError) console.log("User data error: ", userError.message);
    if (userData?.userData) {
      // console.log("User data fetched: ", userData.userData);
      dispatch(updateCurrentUser(userData));
    }
  }, [dispatch, userData, userError, userLoading]);

  useEffect(() => {
    if (loading) console.log("Notification Subscription loading...");
    if (error) console.log("Notification Subscription error:", error);
    if (data) {
      // console.log("Notification Subscription active, new data:", data);
      setNotificationData(data.subNotify);
    }
  }, [data, error, loading]);

  useEffect(() => {
    if (chatMsgLoading) console.log("ChatMsg Subscription loading...");
    if (chatMsgError) console.log("ChatMsg Subscription error:", chatMsgError);
    if (chatMsgData) {
      // console.log("ChatMsg Subscription active, new data:", chatMsgData);
      setChatMsgState(chatMsgData.chatMsg);
    }
  }, [chatMsgData, chatMsgLoading, chatMsgError]);

  return (
    <>
      {currentUser ? (
        <div className="w-full h-screen flex flex-col">
          {/* Header */}
          <header className="w-full flex items-center justify-between px-6 py-3 border-b border-purple-300 bg-white shadow-sm">
            {/* Logo */}
            <div className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-300">
              <h2 className="text-2xl font-extrabold text-purple-700">
                ChatSys
              </h2>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
              <a href="#" className="hover:text-purple-600 transition">
                Home
              </a>
              <a href="#" className="hover:text-purple-600 transition">
                About
              </a>
              <a href="#" className="hover:text-purple-600 transition">
                Sitemap
              </a>
            </nav>

            {/* Profile */}
            <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
              {/* <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold"> */}
              <div className="not-md:w-10 not-md:h-10 w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300">
                <img
                  src={currentUser.profile.avatarUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
                {/* </div> */}
              </div>
              <span className="hidden sm:inline text-lg font-semibold text-purple-900">
                {currentUser.username}
              </span>
            </div>
          </header>

          {/* Grid Layout */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <aside className="bg-gradient-to-b from-purple-100 to-purple-50 flex flex-col h-full w-3/12 md:w-2/12 lg:w-1/6 p-2 border-r border-purple-200 shadow-sm">
              <nav className="flex flex-col gap-3">
                {navLink.map((item: { label: string; route: string }) => (
                  <Link to={item.route} key={item.label}>
                    <button
                      className={`
            relative w-full  py-2 px-4 flex items-center justify-center
            rounded-lg not-md:font-normal font-semibold not-md:text-[12px] text-sm
            bg-gradient-to-r from-blue-500 to-pink-500 text-white
            shadow-md hover:shadow-lg hover:scale-105
            transition-all cursor-pointer duration-300 ease-in-out
          `}
                    >
                      {/* Label */}
                      <span>{item.label}</span>

                      {/* Notification badge */}
                      {item.label === "Notification" && notify && (
                        <span className="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold bg-yellow-500 text-white rounded-full shadow-md">
                          {/* You could put 1 or notify.someCount here */}
                        </span>
                      )}

                      {item.label === "Chat" && chatify && (
                        <span className="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold bg-yellow-500 text-white rounded-full shadow-md">
                          {""}
                        </span>
                      )}
                    </button>
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 relative overflow-y-auto">
              <div className="text-gray-700 text-lg font-medium">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Navigate to={"/signup"} />
      )}
    </>
  );
}

export default IndexPage;
