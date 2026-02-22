import {
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { SEND_MSG } from "../services/ChatService";
import type { userObj } from "../redux/user/userSlice";
import { useSelector } from "react-redux";

interface ChatMessagePayload {
  id: string;
  userId: string;
  chatRoomId: string;
  status: string;
  message: string;
  createdAt: Date;
}

interface MessageSendPayload {
  sendMessage: {
    success: boolean;
    message: {
      id: string;
      status: string;
    };
    timestamp: Date;
  };
}

interface UserInterface {
  user: {
    currentUser: userObj;
    error: string;
    loading: boolean;
  };
}
interface Props {
  chatRoomId: string | undefined;
  setChatMsg: Dispatch<SetStateAction<ChatMessagePayload[]>>;
}

function ChatEditor({ chatRoomId, setChatMsg }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sendMsg] = useMutation<MessageSendPayload>(SEND_MSG);

  const { currentUser } = useSelector((state: UserInterface) => state.user);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto"; // Reset height
    el.style.height = `${el.scrollHeight}px`; // Auto-grow height
    setText(e.target.value);
  };

  const showChatMsg = async () => {
    setLoading(true);
    if (!text.trim()) return;

    // Create local preview message
    const newMsg = {
      id: Date.now().toString(),
      userId: currentUser.id,
      message: text,
      status: "SENDING",
      chatRoomId: chatRoomId!,
      createdAt: new Date(),
    };
    // console.log("New Msg",newMsg);

    setChatMsg((prev) => [
      ...prev,
      {
        id: newMsg.id,
        userId: newMsg.userId!,
        status: newMsg.status,
        message: newMsg.message,
        chatRoomId: newMsg.chatRoomId,
        createdAt: newMsg.createdAt,
      },
    ]);

    setText("");

    try {
      const { data } = await sendMsg({
        variables: { chatRoomId: chatRoomId, text: newMsg.message },
      });

      if (!data) {
        console.error("Error sending message: No data returned");
        alert("Error sending message!");
        setLoading(false);
        return;
      }

      const payload = data?.sendMessage;

      if (!payload.success) {
        console.error("Error sending message: ", payload);
        alert("Network error");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Unexpected error!");
      setLoading(false);
      return;
    }
  };

  useEffect(() => {}, []);

  return (
    <>
      <div className="flex items-end gap-2 w-full">
        {/* Input Area */}
        <div className="flex items-center bg-gray-200 rounded-full px-4 py-2 flex-1 shadow-sm border border-black focus-within:ring-2 focus-within:ring-blue-400 transition-all">
          <button className="text-black hover:text-blue-500 transition-colors">
            <Smile size={20} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            placeholder="Type a message..."
            className="w-full mx-2 bg-transparent resize-none focus:outline-none text-black text-base leading-5 overflow-hidden"
          />

          <button className="text-black hover:text-blue-500 transition-colors">
            <Paperclip size={20} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={showChatMsg}
          disabled={loading}
          className="p-2 rounded-full bg-white hover:bg-blue-600 transition-colors cursor-pointer text-gray-700 shadow-sm active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </>
  );
}

export default ChatEditor;
