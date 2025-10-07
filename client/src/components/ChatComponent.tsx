import { useParams } from "react-router-dom";
import ChatEditor from "./ChatEditor";
import { useQuery } from "@apollo/client/react";
import { RETRIEVE_CHATROOM_DATA } from "../services/ChatService";
import { useEffect, useState } from "react";

type FriendChatStructure = {
  chatCellData: {
    id: string;
    friendshipId: string;
    friendship: {
      user: {
        id: string;
        name: string;
        username: string;
      } | null;
      userId: string;
      friendId: string;
      friend: {
        id: string;
        name: string;
        username: string;
      } | null;
    };
  };
};

function ChatComponent() {
  const params = useParams();
  const { loading, data, error } = useQuery(RETRIEVE_CHATROOM_DATA, {
    variables: { chatRoomId: params.id },
  });
  const [friendState, setFriendState] = useState<
    FriendChatStructure["chatCellData"] | null
  >(null);

  useEffect(() => {
    if (loading) console.log("FriendList is loading...");
    if (error) console.log("FriendList Error", error);
    if (data) {
      console.log("ChatCellData: ", data);
      setFriendState(data.chatCellData);
      console.log(friendState);
    }
  }, [loading, data, error, friendState]);

  return (
    <div className="relative w-full h-[80vh] bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl text-white shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-14 bg-blue-800 flex items-center justify-center border-b border-blue-700 text-lg font-semibold tracking-wide">
        {friendState?.friendship?.user !== null
          ? friendState?.friendship?.user?.name
          : friendState.friendship?.friend?.name}
      </div>

      {/* Chat Inbox */}
      <div
        id="chat-inbox"
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-900"
      >
        {/* Received Message */}
        <div className="flex justify-start">
          <div className="bg-blue-600 px-4 py-2 rounded-2xl rounded-bl-none shadow-md max-w-[75%] text-sm md:text-base animate-fade-in">
            Hello Bro!
          </div>
        </div>

        {/* Sent Message */}
        <div className="flex justify-end">
          <div className="bg-fuchsia-700 px-4 py-2 rounded-2xl rounded-br-none shadow-md max-w-[75%] text-sm md:text-base animate-fade-in">
            Hello!
          </div>
        </div>
      </div>

      {/* Chat Editor */}
      <div
        id="chat-editor"
        className="border-t border-blue-800 bg-blue-900/80 backdrop-blur-md p-3 sticky bottom-0 left-0 z-10"
      >
        <ChatEditor chatRoomId={friendState?.id} />
      </div>
    </div>
  );
}

export default ChatComponent;
