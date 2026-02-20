import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fetchServer } from "../services/SignupService";
import { isValidEmail } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import * as store from "../redux/store.js";
import {
  signInFailure,
  signInStart,
  signInSuccess,
  type userObj,
} from "../redux/user/userSlice";

interface UserInterface {
  user: {
    currentUser: userObj;
    error: string;
    loading: boolean;
  };
}

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  // const { loading, error: errMessage } = useSelector(
  //   (state: store.RootState) => state.user,
  // );
  const { loading, error: errMessage } = useSelector(
    (state: UserInterface) => state?.user,
  );
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidEmail(email)) {
      setErrorMsg("Invalid Email");
      return dispatch(signInFailure("Invalid Email"));
    }

    if (password.length < 8) {
      setErrorMsg("Password length should be greater than 8 Characters");
      return dispatch(
        signInFailure("Password length should be greater than 8 Characters"),
      );
    }

    try {
      dispatch(signInStart());
      const resData = await fetchServer({ name, email, password });

      if (!resData.data) {
        setErrorMsg(resData.errors[0].message);
        dispatch(signInFailure(resData.errors[0].message));
        return;
      }

      setSuccessMsg(`Welcome ${resData.data.createUser.username}`);
      // console.log("Success");
      dispatch(signInSuccess(resData.data.createUser));
      setErrorMsg("");
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error", error);
        dispatch(signInFailure(error.message));
      } else {
        console.log("Unexpected error", error);
        dispatch(signInFailure("An unexpected error occurred"));
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 p-4">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 transition-all duration-500 hover:scale-105">
        Signup
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col bg-white/80 backdrop-blur-md rounded-2xl border border-purple-300 p-6 shadow-xl space-y-5 transition-all duration-500 hover:shadow-2xl"
      >
        {/* Fullname */}
        <div className="flex flex-col">
          <label
            htmlFor="fullname"
            className="font-semibold text-gray-700 mb-1"
          >
            Fullname
          </label>
          <input
            type="text"
            name="fullname"
            id="fullname"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="Your Name"
            className="bg-blue-50 px-3 py-2 rounded-md text-gray-700 outline-none border border-gray-300 focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            name="email"
            id="email"
            className="bg-blue-50 px-3 py-2 rounded-md text-gray-700 outline-none border border-gray-300 focus:ring-2 focus:ring-purple-400 transition-all"
            placeholder="example@email.com"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col relative">
          <label htmlFor="password" className="font-semibold text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            className="bg-blue-50 px-3 py-2 rounded-md text-gray-700 outline-none border border-gray-300 focus:ring-2 focus:ring-purple-400 transition-all"
            placeholder="********"
          />

          {/* Show-or-NotShow Password */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-500 hover:text-purple-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff size={20} className="cursor-pointer" />
            ) : (
              <Eye size={20} className="cursor-pointer" />
            )}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-300 hover:to-green-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          {loading ? "Signingup..." : "Signup"}
        </button>

        {/* Already have an account? */}
        <Link
          to="/login"
          className="flex justify-center text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors duration-200 mt-2"
        >
          Already have an account?
        </Link>
      </form>

      {/* Messages */}
      {errMessage && (
        <div className="bg-red-200 w-full max-w-md flex justify-center items-center py-2 rounded-md mt-4 shadow">
          <p className="text-sm text-red-600 mt-1 text-center">{errMessage}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-200 w-full max-w-md flex justify-center items-center py-2 rounded-md mt-4 shadow">
          <p className="text-sm text-green-600 mt-1 text-center">
            {successMsg}
          </p>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
