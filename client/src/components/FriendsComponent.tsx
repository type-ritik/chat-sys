import { useQuery } from "@apollo/client/react";
import { FRIEND_LIST, FRIEND_REQUEST } from "../services/FriendService";
import { useEffect, useState } from "react";

// FriendListItem: Represents a single friend relationship, including the other user's info and status.
type FriendListItem = {
  id: string;
  otherUser: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  status: string;
};

// FriendReqListItem: Represents a single incoming friend request, including the requesting user's info and status.
type FriendReqListItem = {
  id: string;
  status: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
};

// FriendReqData: Structure for friend request query response.
type FriendReqData = {
  friendRequestList: FriendReqListItem[];
};

function FriendsComponent() {
  // State for the list of friends.
  const [friendList, setFriendList] = useState<FriendListItem[] | null>(null);

  // Query for the friend list.
  const { loading, error, data } = useQuery<{ friendList: FriendListItem[] }>(
    FRIEND_LIST
  );

  // Query for the friend requests.
  const {
    loading: reqLoading,
    error: reqError,
    data: reqData,
  } = useQuery<FriendReqData>(FRIEND_REQUEST);

  // State for the list of friend requests.
  const [friendReqLis, setFriendReqList] = useState<FriendReqListItem[] | null>(
    null
  );

  // Effect to handle query results and errors.
  useEffect(() => {
    if (loading) console.log("FriendList is loading...");
    if (error) console.log("FriendList Error", error);
    if (data) {
      setFriendList(data.friendList);
      setFriendList(data.friendList);
      console.log("Query data:", data.friendList);
    }


    if (reqLoading) console.log("FriendReqList is loading...");
    if (reqError) console.log("FriendReqList Error", reqError);
    if (reqData) {
      setFriendReqList(reqData.friendRequestList);
      console.log("Query friendReqList: ", reqData.friendRequestList);
    }
  }, [loading, error, data, reqLoading, reqData, reqError]);

  // Render the friends and requests sections.
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-gray-50">
      {/* Friends Section */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">
          Friends
        </h1>

        {friendList && friendList.length !== 0 ? (
          <div className="flex flex-col w-full gap-3">
            {friendList.map((item: FriendListItem, index: number) => (
              <div
                key={index}
                className="flex w-full items-center gap-4 p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl shadow-sm justify-between hover:shadow-md transition-all duration-300 ease-in-out"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 flex-shrink-0">
                  <img
                    src={
                      item.otherUser.avatarUrl ||
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0"
                    }
                    alt={item.otherUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                    {item.otherUser.name}
                  </h3>
                  <span className="text-sm text-gray-500 truncate">
                    @{item.otherUser.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No friends found!</div>
        )}
      </div>

      {/* Requests Section */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">
          Requests
        </h1>

        {friendReqLis && friendReqLis.length > 0 ? (
          <div className="flex flex-col w-full gap-3">
            {friendReqLis.map((item: FriendReqListItem, index: number) => (
              <div
                key={index}
                className="flex w-full items-center justify-between gap-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
              >
                {/* Profile */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300 flex-shrink-0">
                    <img
                      src={
                        item.user.avatarUrl ||
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0"
                      }
                      alt={item.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                      {item.user.name}
                    </h3>
                    <span className="text-sm text-gray-500 truncate">
                      @{item.user.username}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="px-3 md:px-4 py-1 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Accept
                  </button>
                  <button className="px-3 md:px-4 py-1 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No requests found!</div>
        )}
      </div>
    </div>
  );
}

export default FriendsComponent;
