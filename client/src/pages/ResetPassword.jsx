import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setisEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setisOtpSubmitted] = useState(false);

  const inputRefs = React.useRef([]);

  // Auto increment the pointer
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Auto decrement the pointer
  const handleBackInput = (e, index) => {
    if (e.target.value === "" && index > 0 && e.key === "Backspace") {
      inputRefs.current[index - 1].focus();
    }
  };

  // Paste Function Logic
  const handlePaste = (e) => {
    e.preventDefault(); // Prevent default paste behavior
    const paste = e.clipboardData.getData("text");
    // Filter out non-numeric characters
    const numbersOnly = paste.replace(/\D/g, "");
    const pasteArray = numbersOnly.split("");

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index] && index < 6) {
        // bounds check
        inputRefs.current[index].value = char;
        // Trigger input event to maintain auto-focus behavior
        const inputEvent = new Event("input", { bubbles: true });
        inputRefs.current[index].dispatchEvent(inputEvent);
      }
    });

    // Focus on the next empty input or the last input
    const nextEmptyIndex = Math.min(pasteArray.length, 5);
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setisEmailSent(true);
    } catch (error) {
      toast.error(data.message);
    }
  };

  const onSubmitOtp= async (e)=>{
    e.preventDefault();
    const otpArray= inputRefs.current.map(e=>e.value)
    setOtp(otpArray.join(''))
    setisOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email,otp, newPassword }
      );
      
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(error.response?.data?.message || "Password reset failed");
    }
  };




  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => {
          navigate("/");
        }}
        src={assets.logo}
        alt="Login Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      {/* form to enter Email and send otp */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          action=""
          className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Your Password
          </h1>
          <p className="text-center text-indigo-300 mb-6">
            Enter your registered Email Address
          </p>
          <div className=" mb-4 w-full flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-3 h-3" />
            <input
              type="email"
              placeholder="Email Id"
              className="bg-transparent outline-none text-white w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            className="rounded-full w-full py-2.5 
  transition-all duration-300 ease-in-out
    bg-gradient-to-r from-indigo-500 to-indigo-900 
    hover:from-indigo-600 hover:to-indigo-950 
    transform hover:scale-[1.02] 
    text-white font-medium tracking-wide
    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
    "
          >
            Send E-mail
          </button>
        </form>
      )}
      {/* otp input field */}

      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Password Reset OTP
          </h1>
          <p className="text-center text-indigo-300 mb-6">
            Enter the 6-digit OTP sent to your email ID
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleBackInput(e, index)}
                />
              ))}
          </div>
          <button
            type="submit"
            className="rounded-full w-full py-2.5 
  transition-all duration-300 ease-in-out
    bg-gradient-to-r from-indigo-500 to-indigo-900 
    hover:from-indigo-600 hover:to-indigo-950 
    transform hover:scale-[1.02] 
    text-white font-medium tracking-wide
    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
    "
          >
            Submit
          </button>
        </form>
      )}
      {/* Enter new Password */}
      {isEmailSent && isOtpSubmitted && (
        <form
        onSubmit={onSubmitNewPassword}
          action=""
          className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center text-indigo-300 mb-6">
            Enter your New Password
          </p>
          <div className=" mb-4 w-full flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input
              type="password"
              placeholder="Password "
              className="bg-transparent outline-none text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="rounded-full w-full py-2.5 
  transition-all duration-300 ease-in-out
    bg-gradient-to-r from-indigo-500 to-indigo-900 
    hover:from-indigo-600 hover:to-indigo-950 
    transform hover:scale-[1.02] 
    text-white font-medium tracking-wide
    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
    "
          >
            Send E-mail
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
