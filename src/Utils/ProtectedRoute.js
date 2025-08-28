import { useProfileContext } from "../Context/fetchProfileContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";


const ProtectedRoute = ({ children }) => {
  const { profile, loading } = useProfileContext();
  const {getProfile} = useProfileContext()
  
  useEffect(()=>{
    getProfile()
  },[])

  if (loading || !profile) {
    return <div className="p-4 text-center text-gray-600">Checking access...</div>; // or a spinner
  }

  return profile.role === "Admin" ? children : <Navigate to="/home" />;
};

export default ProtectedRoute;
