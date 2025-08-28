import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login } from "../APIS/APIS";
import ProcessingIndicator from "../Components/units/processingIndicator";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import {useProfileContext} from '../Context/fetchProfileContext'


export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {getProfile} = useProfileContext()

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
        const response = await login (payload)
        if(response.status ===200){
           toast.success('Login Successful')
           getProfile()
           navigate('/home')
        }else{
            toast.error(response.error || "An error occurred. Please try again.");
            navigate('/')
        }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "An unexpected error occurred. Please try again.";
            console.log(errorMessage);
            toast.error(errorMessage);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 px-4">
      <ToastContainer />
      <div className="w-full max-w-md space-y-6">
        
        {/* Title - Make it pop and positioned with breathing room */}
        <h2 className="text-4xl font-bold text-center text-white drop-shadow-md">
          Property Tracking System
        </h2>
  
        {/* Login Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full">
          <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
            Welcome Back
          </h2>
  
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
  
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 mt-5"
              >
                {showPassword ? <AiFillEyeInvisible size={22} /> : <AiFillEye size={22} />}
              </div>
            </div>
  
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all"
            >
              {loading ? <ProcessingIndicator message="Logging you in..." /> : 'Sign In'}
            </button>
          </form>
  
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <a 
               href="https://prostechnologies.com/contact/" 
               target="_blank" 
                rel="noopener noreferrer"
                 className="text-blue-600 cursor-pointer hover:underline"
             >
               Contact Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}  