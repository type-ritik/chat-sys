import { useState, useRef } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

function ChatEditor() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto"; // Reset height
    el.style.height = `${el.scrollHeight}px`; // Auto-grow height
    setText(e.target.value);
  };

  const showChatMsg = () => {
    if (!text.trim()) return;
    console.log("Message sent:", text);
    setText("");
  };

  return (
    <div className="flex items-end gap-2 w-full">
      {/* Input Area */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 flex-1 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
        <button className="text-gray-500 hover:text-blue-500 transition-colors">
          <Smile size={20} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          className="w-full mx-2 bg-transparent resize-none focus:outline-none text-gray-800 text-base leading-5 overflow-hidden"
        />

        <button className="text-gray-500 hover:text-blue-500 transition-colors">
          <Paperclip size={20} />
        </button>
      </div>

      {/* Send Button */}
      <button
        type="button"
        onClick={showChatMsg}
        className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white shadow-sm active:scale-95"
      >
        <Send size={20} />
      </button>
    </div>
  );
}


export default ChatEditor
