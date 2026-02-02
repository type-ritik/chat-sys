import { Outlet, Link } from "react-router-dom";

const navLink = [
  { label: "Home", route: "/" },
  { label: "Profile", route: "/profile" },
  { label: "Explore", route: "/explore" },
  { label: "Chat", route: "/chat" },
  { label: "Notification", route: "/notification" },
  { label: "Friends", route: "/friends" },
  {label: "Account", route: "/signup"}
];

interface IndexNotifyProps {
  notify: boolean;
  chatify: boolean;
}

function IndexPage({ notify, chatify }: IndexNotifyProps) {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-3 border-b border-purple-300 bg-white shadow-sm">
        {/* Logo */}
        <div className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-extrabold text-purple-700">ChatSys</h2>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <a href="#" className="hover:text-purple-600 transition">
            Home
          </a>
          <a href="#" className="hover:text-purple-600 transition">
            About
          </a>
          <a href="#" className="hover:text-purple-600 transition">
            Sitemap
          </a>
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
          <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold">
            R
          </div>
          <span className="hidden sm:inline text-lg font-semibold text-purple-900">
            {window.localStorage.getItem("username")}
          </span>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-gradient-to-b from-purple-100 to-purple-50 flex flex-col h-full w-3/12 md:w-2/12 lg:w-1/6 p-2 border-r border-purple-200 shadow-sm">
          <nav className="flex flex-col gap-3">
            {navLink.map((item) => (
              <Link to={item.route} key={item.label}>
                <button
                  className={`
            relative w-full  py-2 px-4 flex items-center justify-center
            rounded-lg not-md:font-normal font-semibold not-md:text-[12px] text-sm
            bg-gradient-to-r from-blue-500 to-pink-500 text-white
            shadow-md hover:shadow-lg hover:scale-105
            transition-all duration-300 ease-in-out
          `}
                >
                  {/* Label */}
                  <span>{item.label}</span>

                  {/* Notification badge */}
                  {(item.label === "Notification" && notify) ||
                    (item.label === "Chat" && chatify && (
                      <span
                        className="absolute top-1 right-2 min-w-[18px] h-[18px] px-1
                         flex items-center justify-center text-xs font-bold
                         bg-yellow-500 text-white rounded-full shadow-md"
                      >
                        {""}
                      </span>
                    ))}
                </button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 relative overflow-y-auto">
          <div className="text-gray-700 text-lg font-medium">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default IndexPage;
