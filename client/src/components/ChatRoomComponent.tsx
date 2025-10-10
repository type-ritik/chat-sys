import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { ChartBarIcon, SearchIcon } from "lucide-react";
import {
  CREATE_CHATROOM_CELL,
  EXPLORE_FRIEND,
  RETRIEVE_CHATROOM_LIST,
} from "../services/ChatService";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChatRoomComponent() {
  const { loading, data, error } = useQuery(RETRIEVE_CHATROOM_LIST);
  const [chatData] = useMutation(CREATE_CHATROOM_CELL);
  const [getFriend, { data: explData, loading: expLoading, error: expError }] =
    useLazyQuery(EXPLORE_FRIEND);

  const [chatRoomList, setChatRoomList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.chatRoomList) setChatRoomList(data.chatRoomList);
  }, [data]);

  const handleChat = async (id) => {
    const payload = await chatData({ variables: { friendshipId: id } });

    if (payload.error) {
      console.log("Error: ", error);
      return;
    }

    navigate(`/friends/chat/${payload.data.chatRoomCell.id}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg("");
    setSearchResult(null);

    if (!searchInput.trim()) {
      setErrMsg("Please enter a username or email");
      return;
    }

    try {
      const { data } = await getFriend({
        variables: { username: searchInput },
      });
      if (!data?.exploreChatFriend) {
        setErrMsg("No user found");
      } else {
        setSearchResult(data.exploreChatFriend);
      }
    } catch {
      setErrMsg("Error fetching user data");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[80vh]">
      {/* Search Friend Section */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 ease-in-out">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 w-full max-w-md bg-white p-3 rounded-lg shadow-md border border-gray-200"
        >
          <div className="relative flex-1">
            <input
              type="search"
              name="search"
              id="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
              placeholder="Search your friend..."
            />
            <SearchIcon className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <button
            type="submit"
            disabled={expLoading}
            className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 active:scale-95 transition-all duration-200"
          >
            {expLoading ? "..." : "Find"}
          </button>
        </form>

        {/* Search Result */}
        <div className="mt-6 w-full max-w-md">
          {errMsg && (
            <div className="bg-red-100 text-red-600 font-medium text-sm text-center py-2 rounded-md shadow-md">
              {errMsg}
            </div>
          )}

          {searchResult && (
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=688"
                  alt="User avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {searchResult.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{searchResult.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleChat(searchResult.id)}
                className="px-4 py-2 bg-green-500 text-white font-medium text-sm rounded-md hover:bg-green-400 active:scale-95 transition"
              >
                Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Room List */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 ease-in-out">
        <h1 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ChartBarIcon className="text-blue-600" /> Your Rooms
        </h1>

        <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          {chatRoomList.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/friends/chat/${item.id}`)}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688"
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col truncate">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                  {item.friendship.otherUser.name}
                </h3>
                <span className="text-sm text-gray-500 truncate">
                  {item.lastMsg?.message || "No messages yet"}
                </span>
              </div>
            </div>
          ))}

          {!loading && chatRoomList.length === 0 && (
            <div className="text-center text-gray-500 italic mt-6">
              No chat rooms yet. Start chatting!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatRoomComponent;
