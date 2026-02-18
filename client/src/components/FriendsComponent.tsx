import { useMutation, useQuery } from "@apollo/client/react";
import {
  ACCEPT_REQUEST,
  FRIEND_LIST,
  FRIEND_REQUEST,
  REJECT_REQUEST,
} from "../services/FriendService";
import { useEffect, useState } from "react";
import { MessageCircle, MessageSquareText } from "lucide-react"; // pick whichever you like
import { CREATE_CHATROOM_CELL } from "../services/ChatService";
import { useNavigate } from "react-router-dom";

// FriendListItem: Represents a single friend relationship, including the other user's info and status.
type FriendListItem = {
  id: string;
  username: string;
  name: string;
  profile: {
    avatarUrl: string;
  };
};

// FriendReqListItem: Represents a single incoming friend request, including the requesting user's info and status.
type FriendReqListItem = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    profile: {
      avatarUrl: string;
    };
  };
};

interface ChatRoomCellPayload {
  chatRoomCell: {
    id: string;
    friendshipId: string;
    createdAt: Date;
  };
}

// FriendReqData: Structure for friend request query response.
type FriendReqData = {
  friendRequestList: FriendReqListItem[];
};

function FriendsComponent() {
  // State for the list of friends.
  const [friendList, setFriendList] = useState<FriendListItem[] | null>(null);

  // Query for the friend list.
  const { loading, error, data } = useQuery<{ friendList: FriendListItem[] }>(
    FRIEND_LIST,
  );

  // Query for the friend requests.
  const {
    loading: reqLoading,
    error: reqError,
    data: reqData,
  } = useQuery<FriendReqData>(FRIEND_REQUEST);

  // State for the list of friend requests.
  const [friendReqLis, setFriendReqList] = useState<FriendReqListItem[] | null>(
    null,
  );

  // Create ChatRoom
  const [chatRoomCellData] =
    useMutation<ChatRoomCellPayload>(CREATE_CHATROOM_CELL);

  const navigate = useNavigate();

  // Effect to handle query results and errors.
  useEffect(() => {
    if (loading) console.log("FriendList is loading...");
    if (error) console.log("FriendList Error", error);
    if (data) {
      setFriendList(data.friendList);
      setFriendList(data.friendList);
    }
  }, [loading, error, data]);

  useEffect(() => {
    if (reqLoading) console.log("FriendReqList is loading...");
    if (reqError) console.log("FriendReqList Error", reqError);
    if (reqData) {
      setFriendReqList(reqData.friendRequestList);
    }
  }, [reqLoading, reqData, reqError]);

  // Mutation hook for accepting friend requests
  const [acceptRequest] = useMutation(ACCEPT_REQUEST);

  // Mutation hook for rejecting friend requests
  const [rejectRequest] = useMutation(REJECT_REQUEST);

  // Accept friend Request
  const handleAcceptReq = async (id: string) => {
    if (!id) {
      console.log("Client Error");
      return;
    }

    try {
      await acceptRequest({
        variables: { friendshipId: id, status: "ACCEPTED" },
      });
      console.log("Request Accepted");
    } catch (error) {
      console.log("Mutation Error:", error);
    }
  };

  // Reject friend Request
  const handleRejectReq = async (id: string) => {
    if (!id) {
      console.log("Client Error");
      return;
    }
    try {
      await rejectRequest({
        variables: { friendshipId: id, status: "REJECTED" },
      });
      console.log("Request Rejected");
    } catch (error) {
      console.log("Mutation Error:", error);
    }
  };

  const handleChatOpen = async (id: string) => {
    if (!id) {
      console.log("Client Error");
      return;
    }

    try {
      const { data } = await chatRoomCellData({
        variables: { friendshipId: id },
      });

      if (data) {
        // console.log("ChatRoomCell Data", data);

        navigate(`chat/${data.chatRoomCell.id}`);
      }
    } catch (error) {
      console.log("Mutation Error:", error);
    }
  };

  // Render the friends and requests sections.
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-gray-50">
      {/* Friends Section */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <MessageSquareText className="text-pink-500" /> Friends
        </h1>

        {friendList && friendList.length !== 0 ? (
          <div className="flex flex-col w-full gap-3">
            {friendList.map((item: FriendListItem, index: number) => (
              <div
                key={index}
                onClick={() => handleChatOpen(item.id)}
                className="flex w-full items-center gap-4 p-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl shadow-sm justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out"
              >
                {/* Avatar */}
                <div className="not-md:w-10 not-md:h-10 h-12 w-12 rounded-full overflow-hidden border-2 border-pink-300 flex-shrink-0">
                  <img
                    src={item.profile.avatarUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <h3 className="not-md:text-sm text-base md:text-lg font-bold text-gray-700 truncate">
                    {item.name}
                  </h3>
                  <span className="not-md:text-[10px] text-sm text-gray-500 truncate">
                    @{item.username}
                  </span>
                </div>

                {/* Chat Message Icon */}
                <button
                  className="p-2 not-md:hidden bg-pink-100 hover:bg-pink-200 rounded-full text-pink-600 hover:text-pink-700 transition-colors duration-200"
                  onClick={() => handleChatOpen(item.id)}
                  title="Message"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 not-md:text-sm italic">
            No friends found!
          </div>
        )}
      </div>

      {/* Requests Section */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <MessageCircle className="text-blue-500" /> Requests
        </h1>

        {friendReqLis && friendReqLis.length > 0 ? (
          <div className="flex flex-col w-full gap-3">
            {friendReqLis.map((item: FriendReqListItem, index: number) => (
              <div
                key={index}
                className="flex w-full items-center justify-between gap-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out"
              >
                {/* Profile */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-300 flex-shrink-0">
                    <img
                      src={item.user.profile.avatarUrl}
                      alt={item.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                      {item.user.name}
                    </h3>
                    <span className="text-sm not-md:text-[12px] text-gray-500 truncate">
                      @{item.user.username}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex not-md:flex-col gap-4 not-md:gap-2">
                  <button
                    className="px-2 md:px-4 py-1 text-medium font-normal not-md:px-2 not-md:py-1 not-md:text-[10px] not-md:font-normal cursor-pointer bg-green-500 text-white rounded-lg not-md:rounded-sm hover:bg-green-600 transition-colors"
                    onClick={() => handleAcceptReq(item.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="px-2 md:px-4 py-1 text-medium font-normal cursor-pointer not-md:rounded-sm not-md:px-2 not-md:py-1 bg-red-500 not-md:text-[10px] not-md:font-normal text-white rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => handleRejectReq(item.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 not-md:text-sm italic">
            No requests found!
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsComponent;
