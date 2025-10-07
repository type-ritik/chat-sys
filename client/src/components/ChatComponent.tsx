import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import ChatEditor from "./ChatEditor";
import { RETRIEVE_CHAT_MSG, RETRIEVE_CHATROOM_DATA } from "../services/ChatService";

function ChatComponent() {
  const params = useParams();
  const userId = localStorage.getItem("userId");

  const { loading, data, error } = useQuery(RETRIEVE_CHATROOM_DATA, {
    variables: { chatRoomId: params.id },
  });

  const { data: chatMsgData } = useQuery(RETRIEVE_CHAT_MSG, {
    variables: { chatRoomId: params.id },
    pollInterval: 2000, // refresh every 2 sec for real-time feel
  });

  const [friendState, setFriendState] = useState(null);
  const [chatMsg, setChatMsg] = useState([]);

  useEffect(() => {
    if (data) setFriendState(data.chatCellData);
  }, [data]);

  useEffect(() => {
    if (chatMsgData) setChatMsg(chatMsgData.chatMessageList);
  }, [chatMsgData]);

  return (
    <div className="relative w-full h-[80vh] bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl text-white shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-14 bg-blue-800 flex items-center justify-center border-b border-blue-700 text-lg font-semibold tracking-wide">
        {friendState?.friendship?.user?.name ||
          friendState?.friendship?.friend?.name ||
          "Chat"}
      </div>

      {/* Chat Inbox */}
      <div
        id="chat-inbox"
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-900"
      >
        {chatMsg.map((item) => {
          const isSender = item.userId === userId;
          return (
            <div key={item.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 rounded-2xl shadow-md max-w-[75%] text-sm md:text-base transition-all duration-300 ${
                  isSender
                    ? "bg-fuchsia-700 rounded-br-none"
                    : "bg-blue-600 rounded-bl-none"
                }`}
              >
                {item.message}
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
        <ChatEditor chatRoomId={friendState?.id} setChatMsg={setChatMsg} />
      </div>
    </div>
  );
}

export default ChatComponent;
