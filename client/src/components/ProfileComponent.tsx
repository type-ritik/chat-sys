import { useState } from "react";
import { Camera } from "lucide-react";

function ProfileComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1759508949812-973dcd259b6e?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=600"
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-[80vh] bg-gradient-to-br from-purple-50 to-pink-50 flex justify-center items-center p-4 rounded-2xl">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-8 flex flex-col gap-8 transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-gray-700 font-medium text-sm">
            <span className="text-gray-500">@</span>ritik.vw98
          </div>

          <div className="relative group">
            {/* Profile Image */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-300 shadow-md">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Upload Button */}
            <label
              htmlFor="profileUpload"
              className="absolute bottom-2 right-2 bg-purple-500 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-4 h-4" />
              <input
                id="profileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Online
          </div>
        </div>

        {/* Body */}
        <form className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="Ritik Sharma"
              disabled={!isEditing}
              className={`w-full sm:w-3/4 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 ${
                isEditing ? "focus:ring-purple-400" : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="email"
              placeholder="ritik.vw98@gmail.com"
              disabled={!isEditing}
              className={`w-full sm:w-3/4 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 ${
                isEditing ? "focus:ring-purple-400" : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <textarea
              placeholder="This is Ritik Sharma. Nothing scares me."
              disabled={!isEditing}
              className={`w-full sm:w-3/4 px-4 py-2 border rounded-lg resize-none text-gray-700 focus:outline-none focus:ring-2 ${
                isEditing ? "focus:ring-purple-400" : "bg-gray-100 cursor-not-allowed"
              }`}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-6 py-2 rounded-full bg-purple-500 text-white font-medium hover:bg-purple-600 transition-all duration-200"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>

            {isEditing && (
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-all duration-200"
              >
                Save Changes
              </button>
            )}

            <button
              type="button"
              className="px-6 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileComponent;
