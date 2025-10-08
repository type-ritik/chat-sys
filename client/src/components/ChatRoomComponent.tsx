import { ChartBarIcon } from "lucide-react";

function ChatRoomComponent() {
  return (
    <div className="flex flex-col w-full h-full md:flex-row gap-6 p-4 md:p-6 bg-gray-50 ">
      {/* Handle ChatRoom */}
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-5">
        <form className="flex gap-2 w-full max-w-md bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <input
            type="search"
            name="search"
            id="search"
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-purple-400 transition"
            placeholder="Search your friend"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition"
          >
            Find
          </button>
        </form>

        {/* Search Result */}
        <div className="mt-6 w-full max-w-md">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg shadow hover:shadow-lg transition">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Ritik</h3>
            </div>
            <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-400 transition">
              Chat
            </button>
          </div>

          {/* Error Msg */}
          <div className="text-gray-500 text-center">
            <div className="bg-red-200 text-red-600 font-medium text-sm w-full max-w-md flex justify-center items-center py-2 rounded-md mt-4 shadow">
              Error
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ChartBarIcon className="text-blue-500" /> Room
        </h1>

        <div className="flex flex-col w-full gap-3">
          <div className="flex w-full items-center justify-baseline gap-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0"
                  alt="User A"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                  Ritik
                </h3>
                <span className="text-sm text-gray-500 truncate">
                  Hello friend
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomComponent;
