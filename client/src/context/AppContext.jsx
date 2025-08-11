import axios from 'axios';
import { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials=true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setisLoggedIn] = useState(false)
    const [userData, setUserData] = useState(null)
    
    const getAuthState = async () => {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            
            if (data.success) {
                setUserData(data.userData); // Use userData from auth response
                setisLoggedIn(true);
                // Don't call getUserData() again since we already have the data
            } else {
                // Reset state on failure
                setUserData(null);
                setisLoggedIn(false);
                // Don't show error toast on initial load - user might not be logged in
                console.log("Not authenticated:", data.message);
            }
        } catch (error) {
            // Reset state on error
            setUserData(null);
            setisLoggedIn(false);
            console.error("Auth check failed:", error.response?.data?.message || error.message);
            // Don't show error toast on initial load
        }
    }
    
    const getUserData = async () => {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.get(backendUrl + '/api/user/data')
            
            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to get user data");
        }
    }
    
    useEffect(() => {
        getAuthState();
    }, [])
    
    const value = {
        backendUrl,
        isLoggedIn, 
        setisLoggedIn,
        userData, 
        setUserData, 
        getUserData,
        getAuthState // Export this so login can call it
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}