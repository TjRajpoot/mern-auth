import React, { useContext } from "react";
import assets from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate=useNavigate()
  const {userData, isLoggedIn} = useContext(AppContext)

  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-grey-800">
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey {userData?userData.name:'Developer'}!{" "}
      </h1>
      <h2 className="text-3xl sm:text-5xl">Welcome to my web application</h2>
      <p className="mb-8 max-w-md">
        Lets start this journey together. But first you have to login first!
      </p>
      {!isLoggedIn && (<button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 border rounded-full border-gray-500 px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
              >
                Get Started! <img src={assets.arrow_icon} alt="" />
              </button>)}
    </div>
  );
};

export default Header;
