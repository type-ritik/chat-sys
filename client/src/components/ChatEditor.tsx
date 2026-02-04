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

interface ChatMessagePayload {
   id: string;
  userId: string;
  chatRoomId: string;
  message: string;
  createdAt: Date;
}

interface MessageSendPayload {
  sendMessage: boolean;
}

interface Props {
  chatRoomId: string | undefined;
  setChatMsg: Dispatch<SetStateAction<ChatMessagePayload[]>>;
}

function ChatEditor({ chatRoomId, setChatMsg }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sendMsg] = useMutation<MessageSendPayload>(SEND_MSG);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto"; // Reset height
    el.style.height = `${el.scrollHeight}px`; // Auto-grow height
    setText(e.target.value);
  };

  const showChatMsg = async () => {
    if (!text.trim()) return;

    // Create local preview message
    const newMsg = {
      id: Date.now().toString(),
      userId: localStorage.getItem("userId"),
      message: text,
      chatRoomId: chatRoomId!,
      createdAt: new Date(),
    };
    // console.log("New Msg",newMsg);

    setChatMsg((prev) => [
      ...prev,
      {
        id: newMsg.id,
        userId: newMsg.userId!,
        message: newMsg.message,
        chatRoomId: newMsg.chatRoomId,
        createdAt: newMsg.createdAt,
      },
    ]);

    const isMsgSend = await sendMsg({
      variables: { chatRoomId: chatRoomId, text: text },
    });
    if (isMsgSend.error) {
      if (isMsgSend.error instanceof Error) {
        console.error("Error sending message:", isMsgSend.error.message);
      } else {
        console.log("Message Erro: ", isMsgSend.error);
        throw new Error("Unexpected error occured");
      }
    }
    // console.log("Message sent:", isMsgSend.data);
    setText("");
  };

  useEffect(() => {}, []);

  return (
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
        className="p-2 rounded-full bg-white hover:bg-blue-600 transition-colors text-gray-700 shadow-sm active:scale-95"
      >
        <Send size={20} />
      </button>
    </div>
  );
}

export default ChatEditor;
