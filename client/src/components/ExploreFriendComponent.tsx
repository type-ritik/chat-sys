import React, { useState } from "react";
import { fetchFollowFriend, fetchFriend } from "../services/FriendService";

function ExploreFriendComponent() {
  const [searchInput, setSearchInput] = useState("");
  type Friend = {
    id: string;
    name: string;
    email: string;
  };

  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchResult(null);

    if (!searchInput.trim()) {
      setErrorMsg("Please enter a name or email");
      return;
    }

    // Mock response
    const resData = await fetchFriend(searchInput);

    if (resData.res === false) {
      setErrorMsg(resData.msg);
      return;
    }

    setSearchResult(resData.data.exploreFriends);
    setErrorMsg("");
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    const resData = await fetchFollowFriend(searchResult.id);
    if (resData.res === false) {
      setErrorMsg(resData.msg);
    }
    alert(`Friend request sent to ${searchResult.name}`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 not-md:flex-col not-md:w-full w-full max-w-md bg-white p-3 rounded-lg shadow-md border border-gray-200"
      >
        <input
          type="search"
          name="search"
          id="search"
          value={searchInput}
          placeholder="Search your friend"
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          className="flex-1 px-3 not-md:text-sm not-md:font-normal py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 not-md:text-base text-white font-semibold rounded-md hover:bg-purple-500 transition"
        >
          Find
        </button>
      </form>

      {/* Search Result */}
      <div className="mt-6 w-full max-w-md">
        {searchResult ? (
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg shadow hover:shadow-lg transition">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {searchResult.name}
              </h3>
              <p className="text-sm text-gray-600">{searchResult.email}</p>
            </div>
            <button
              onClick={handleSendRequest}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-400 transition"
            >
              Add Friend
            </button>
          </div>
        ) : (
          <>
            {/* Error Message */}
            <div className="text-gray-500  text-center">
              {errorMsg && (
                <div className="bg-red-200 text-red-600 font-medium text-sm w-full max-w-md flex justify-center items-center py-2 rounded-md mt-4 shadow">
                  {errorMsg}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ExploreFriendComponent;
