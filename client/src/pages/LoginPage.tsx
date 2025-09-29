import React, { useState } from "react";
import { fetchServer } from "../services/LoginService";
import { isValidEmail } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setErrorMsg("Invalid Email");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password length should be greater than 8");
      return;
    }

    const resData = await fetchServer({ email, password });

    if (resData.res === false) {
      setErrorMsg(resData.msg);
      return;
    }

    setSuccessMsg(`Welcome back ${resData.data.loginUser.username}`);
    setErrorMsg("");
    navigate("/");
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 p-4">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 transition-all duration-500 hover:scale-105">
        Login Now
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col bg-white/80 backdrop-blur-md rounded-2xl border border-purple-300 p-6 shadow-xl space-y-5 transition-all duration-500 hover:shadow-2xl"
      >
        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            name="email"
            className="bg-blue-50 px-3 py-2 rounded-md text-gray-700 outline-none border border-gray-300 focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col relative">
          <label
            htmlFor="password"
            className="font-semibold text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            name="password"
            className="bg-blue-50 px-3 py-2 rounded-md text-gray-700 outline-none border border-gray-300 focus:ring-2 focus:ring-purple-400 transition-all pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-500 hover:text-purple-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="cursor-pointer" size={20} />
            ) : (
              <Eye size={20} className="cursor-pointer" />
            )}
          </button>
        </div>

        {/* Reset Password */}
        <Link
          to="/reset-pass"
          className="flex justify-end text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-1"
        >
          Reset password?
        </Link>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-300 hover:to-green-500 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          Login
        </button>

        {/* Need account? */}
        <Link
          to="/signup"
          className="flex justify-center text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors duration-200 mt-2"
        >
          Create New Account?
        </Link>
      </form>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-red-200 text-red-800 w-full max-w-md flex justify-center items-center py-2 rounded-md mt-4 shadow">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-200 text-green-800 w-full max-w-md flex justify-center items-center py-2 rounded-md mt-4 shadow">
          {successMsg}
        </div>
      )}
    </div>
  );
}

export default LoginPage;
