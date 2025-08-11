import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from 'axios'
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate()
  const {backendUrl,setisLoggedIn,getUserData} = useContext(AppContext)

  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const onSubmitHandler = async (e) => {
  e.preventDefault();
  axios.defaults.withCredentials = true;

  try {
    if (state === "Sign Up") {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data.success) {
        setisLoggedIn(true);
        getUserData();
        navigate('/');
      } else {
        toast.error(data.message);
      }

    } else {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data.success) {
        setisLoggedIn(true);
        getUserData();
        navigate('/');
      } else {
        toast.error(data.message);
      }
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
    console.error("Auth error:", error);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 ">
      <img
      onClick={()=>{navigate('/')}}
        src={assets.logo}
        alt="Login Logo"
        className="w-15 sm:w-30 cursor-pointer mb-15"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white mb-3">
          {state === "Sign Up"
            ? "Create your Account"
            : "Login to your Account"}
        </h2>
        <p className="text-center mb-6 text-sm">
          {state === "Sign Up"
            ? "Create your Account"
            : "Login to your Account"}
        </p>

        <form onSubmit={onSubmitHandler} action="">
          {state === "Sign Up" && (
            <div className="flex items-center mb-4 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none text-white w-full"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}
          <div className="flex items-center mb-4 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none text-white w-full"
              type="email"
              placeholder="Email ID"
              required
            />
          </div>
          <div className="flex items-center mb-4 gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none text-white w-full"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          {state === "Login" && (<p onClick={()=>navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer hover:text-amber-100 w-fit">
            Forgot Password
          </p>)}
          
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
            {state}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an Account?{"   "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline hover:text-amber-100"
            >
              Login Here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an Account?{"   "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline hover:text-amber-100"
            >
              Register Here
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
