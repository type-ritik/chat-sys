import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import ChatEditor from "./ChatEditor";
import {
  RETRIEVE_CHAT_MSG,
  RETRIEVE_CHATROOM_DATA,
} from "../services/ChatService";
import { useSelector } from "react-redux";
import type { userObj } from "../redux/user/userSlice";
import { Check, CloudAlert, Ellipsis } from "lucide-react";

interface UserPayload {
  id: string;
  name: string;
  username: string;
  profile: {
    id: string;
    isActive: boolean;
    avatarUrl: string;
  };
}

interface ChatCellPayload {
  chatRoomId: string;
  otherUser: UserPayload;
}

interface UserInterface {
  user: {
    currentUser: userObj;
    error: string;
    loading: boolean;
  };
}

interface ChatRoomCellPayload {
  chatCellData: ChatCellPayload;
  friendshipId: string;
}

interface ChatMessagePayload {
  id: string;
  userId: string;
  chatRoomId: string;
  status: string;
  message: string;
  createdAt: Date;
}

interface ChatMessageListPayload {
  chatMessageList: ChatMessagePayload[] | [];
}

function ChatComponent() {
  const params = useParams();
  const { currentUser } = useSelector((state: UserInterface) => state.user);

  const { data } = useQuery<ChatRoomCellPayload | null>(
    RETRIEVE_CHATROOM_DATA,
    {
      variables: { chatRoomId: params.id },
    },
  );

  const { data: chatMsgData } = useQuery<ChatMessageListPayload | null>(
    RETRIEVE_CHAT_MSG,
    {
      variables: { chatRoomId: params.id },
      pollInterval: 2000, // refresh every 2 sec for real-time feel
    },
  );

  const [friendState, setFriendState] = useState<ChatCellPayload | null>(null);
  const [chatMsg, setChatMsg] = useState<ChatMessagePayload[]>([]);

  useEffect(() => {
    // console.log("FriendState: ", data);
    // console.log("Extra: ", data?.chatCellData);
    if (data) setFriendState(data?.chatCellData);
  }, [data]);

  const handleTime = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Set to false for 24hr format
    });
    return { time };
  };

  const handleDayChatMessage = (userDate: string | Date) => {
    const today = new Date();
    const userD = new Date(userDate);

    // Normalize both to midnight to compare days accurately
    const todayReset = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const userDReset = new Date(
      userD.getFullYear(),
      userD.getMonth(),
      userD.getDate(),
    );

    // Calculate difference in days
    const diffTime = todayReset.getTime() - userDReset.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const timeStr = handleTime(userDate).time;

    // 1. Today
    if (diffDays === 0) {
      return { time: timeStr, date: "Today" };
    }

    // 2. Yesterday
    if (diffDays === 1) {
      return { time: timeStr, date: "Yesterday" };
    }

    // 3. Within the last 7 days (Monday - Sunday)
    if (diffDays > 1 && diffDays < 7) {
      const weekday = userD.toLocaleString("en-IN", { weekday: "long" });
      return { time: timeStr, date: weekday };
    }

    // 4. Older than a week (e.g., 24 January 2026)
    const fullDate = userD.toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return { time: timeStr, date: fullDate };
  };

  useEffect(() => {
    // console.log("Msg", chatMsgData);
    if (chatMsgData) setChatMsg(chatMsgData?.chatMessageList);
  }, [chatMsgData]);

  return (
    <div className="relative w-full h-[80vh] bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl text-white shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-14 bg-blue-800 flex items-center justify-center border-b border-blue-700 text-lg font-semibold tracking-wide">
        <div className="not-md:w-10 not-md:h-10 w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300">
          <img
            src={friendState?.otherUser.profile.avatarUrl}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="not-md:text-[12px] ml-2 text-base md:text-lg font-semibold text-white truncate">
          {friendState?.otherUser.name}
        </h3>
      </div>

      {/* Chat Inbox */}
      <div
        id="chat-inbox"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 scrollbar-thin scrollbar-thumb-blue-600"
      >
        {chatMsg.map((item, index) => {
          const isSender = item.userId === currentUser.id;
          const msgDateInfo = handleDayChatMessage(item.createdAt);

          // Logic to show Date Header only when the day changes
          const prevMsg = chatMsg[index - 1];
          const showDateHeader =
            !prevMsg ||
            handleDayChatMessage(prevMsg.createdAt).date !== msgDateInfo.date;

          return (
            <div key={item.id} className="flex flex-col">
              {/* Centered Date Header */}
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-700">
                    {msgDateInfo.date}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`flex ${isSender ? "justify-end" : "justify-start"} mb-1`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl shadow-md max-w-[75%] text-sm md:text-base transition-all ${
                    isSender
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <p>{item.message}</p>
                  <div
                    className={`mt-1 gap-1 flex ${isSender ? "justify-end" : "justify-start"} opacity-70`}
                  >
                    <p className="text-[10px]">{msgDateInfo.time}</p>
                    {isSender && (
                      <p className="text-[10px] ">
                        {item.status === "SENT" && (
                          <Check size={"15px"} color="blue" />
                        )}
                        {item.status === "SENDING" && (
                          <Ellipsis size={"15px"} color="white" />
                        )}
                        {item.status === "FAILED" && (
                          <CloudAlert size={"15px"} color="red" />
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Editor */}
      <div
        id="chat-editor"
        className="border-t border-blue-800 bg-blue-900/80 backdrop-blur-md p-3 sticky bottom-0 left-0 z-10"
      >
        <ChatEditor
          chatRoomId={friendState?.chatRoomId}
          setChatMsg={setChatMsg}
        />
      </div>
    </div>
  );
}

export default ChatComponent;
