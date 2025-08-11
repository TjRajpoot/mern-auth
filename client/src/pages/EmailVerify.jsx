import React, { useContext, useRef,useEffect, use } from "react";
import assets from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Add this import

const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContext);
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

  // Fixed submit handler
  const onSubmitHandler = async (e) => {
    // Add 'e' parameter
    try {
      e.preventDefault(); // Move preventDefault to the beginning

      const otpArray = inputRefs.current.map((input) => input.value);
      const otp = otpArray.join("");

      // Validate OTP length
      if (otp.length !== 6) {
        toast.error("Please enter all 6 digits");
        return;
      }

      console.log("Sending OTP:", otp); // Debug log

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Verification error:", error); // Debug log
      toast.error(
        error.response?.data?.message || error.message || "Verification failed"
      );
    }
  };
  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate('/')
  }, [isLoggedIn,userData])
  

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
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
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
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
