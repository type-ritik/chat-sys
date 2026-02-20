import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  UPDATE_AVATAR,
  updateData,
  USER_DATA,
} from "../services/ProfileService";
import imageCompression from "browser-image-compression";
import { Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logOut, updateAvatarUrl, type userObj } from "../redux/user/userSlice";
// import { useNavigate } from "react-router-dom";

interface UserData {
  userData: {
    id: string;
    name: string;
    isAdmin: boolean;
    username: string;
    profile: {
      bio: string;
      avatarUrl: string;
      isActive: boolean;
    };
  };
}

interface UserInterface {
  user: {
    currentUser: userObj;
    error: string;
    loading: boolean;
  };
}

function ProfileComponent() {
  const { error, data, loading } = useQuery<UserData | null>(USER_DATA);
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileUrl, setImageFileUrl] = useState<string | null>(null);
  const { currentUser } = useSelector((state: UserInterface) => state.user);
  interface UpdateAvatarData {
    updateAvatar: {
      avatarUrl: string;
    };
  }
  const [updateAvatar] = useMutation<UpdateAvatarData>(UPDATE_AVATAR);

  const dispatch = useDispatch();
  // const navigate = useNavigate();

  useEffect(() => {
    if (loading) console.log("User data is loading...");
    if (error) console.log("User data error: ", error.message);
    if (data) {
      // console.log(data);
      setName(data?.userData?.name);
      setUsername(data.userData.username);
      setIsAdmin(data.userData.isAdmin);
      setBio(data.userData.profile.bio);
      setIsOnline(data.userData.profile.isActive);
    }
  }, [error, data, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await updateData({ name, username, bio });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof TypeError) {
        console.log("Code Logic Error: ", error.message);
      } else if (error instanceof Error) {
        console.log("Error updating profile: ", error.message);
      }
      // dispatch(signInFailure(error.message));
      return;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    // setImageFile(file);
    if (file) {
      setImageFileUrl(URL.createObjectURL(file));
    } else {
      setImageFileUrl(null);
    }

    // console.log(`Original file size: ${file?.size / 1024 / 1024} MB`);
    // const fileName = new Date().getTime() + file.name;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/*",
    };

    try {
      if (file) {
        const compressedFile = await imageCompression(file, options);
        // console.log("Compressed file: ", compressedFile);
        const { data: avatarData } = await updateAvatar({
          variables: { file: compressedFile },
        });

        // console.log("DAta: ", avatarData);

        const newUrl = avatarData?.updateAvatar?.avatarUrl;

        // console.log(newUrl);
        if (newUrl) {
          dispatch(updateAvatarUrl(newUrl));
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        // console.log("Error compressing image: ", error.message);
      }
    }

    // if (file) {
    //   const reader = new FileReader();

    //   reader.onload = async () => {
    //     const result = reader.result as string;
    //     setProfileImage(result);
    //     // console.log("Profile (Base64):", result);

    //     await updateAvatar({ avatarUrl: result });

    //     // console.log("Avatar update response:", dat);

    //     // console.log("Profile picture after change ", profileImage);

    //     // Log here to see the actual Base64 string
    //   };

    //   reader.readAsDataURL(file); // Correctly passing the File object
    //   // console.log("Raw file object:", file); // This log is fine here
    // }
  };

  const handleLogOut = () => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    dispatch(logOut());
  };

  return (
    <div className="w-full h-[80vh] bg-gradient-to-br from-purple-50 to-pink-50 flex justify-center items-center p-4 rounded-2xl">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-8 flex flex-col gap-8 transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-gray-700 font-medium text-sm">
            <span className="text-gray-500">#</span>
            {isAdmin ? "ADMIN" : "USER"}
          </div>

          <div className="relative group">
            {/* Profile Image */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-300 shadow-md">
              <img
                src={imageFileUrl || currentUser.profile.avatarUrl}
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
                name="profileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Body */}
        <form
          className="flex flex-col gap-5"
          id="userForm"
          name="userForm"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              id="inputName"
              name="inputName"
              placeholder={currentUser.name || "No name"}
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
              className={`w-full sm:w-3/4 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 ${
                isEditing
                  ? "focus:ring-purple-400"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="username"
              id="inputUsername"
              name="inputUsername"
              placeholder={currentUser.username || "No username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isEditing}
              className={`w-full sm:w-3/4 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 ${
                isEditing
                  ? "focus:ring-purple-400"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <textarea
              placeholder={currentUser.profile.bio}
              value={bio}
              id="inputBio"
              name="inputBio"
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              className={`w-full sm:w-3/4 px-4 py-2 border rounded-lg resize-none text-gray-700 focus:outline-none focus:ring-2 ${
                isEditing
                  ? "focus:ring-purple-400"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-6 py-2 rounded-full bg-purple-500 text-white cursor-pointer font-medium hover:bg-purple-600 transition-all duration-200"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>

            {isEditing && (
              <button
                type="submit"
                className="px-6 py-2 rounded-full cursor-pointer bg-green-500 text-white font-medium hover:bg-green-600 transition-all duration-200"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
        <div className="flex items-center justify-between py-1">
          <button
            type="button"
            onClick={() => handleLogOut()}
            className="px-6 py-2 rounded cursor-pointer bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded cursor-pointer bg-blue-500 font-medium hover:bg-blue-600 text-white transition-colors duration-200"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileComponent;
