import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { FaCarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    "Real-time property tracking",
    "Tenant management",
    "Rent collection",
    "Maintenance requests",
    "Vehicle fleet overview",
    "Booking management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 px-4 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            <span className="text-blue-600">Streamline</span> Your Property & Vehicle Management
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            All-in-one platform to efficiently manage your real estate and vehicle rentals with powerful tools and analytics.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiHome className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Property Management</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Comprehensive tools to manage all aspects of your rental properties from tenant screening to maintenance.
            </p>
            <button
              onClick={() => navigate("/apartments/dashboard")}
              className="flex items-center text-blue-600 font-medium group"
            >
              Go to Dashboard
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCarAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Vehicle Rentals</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Complete solution for managing your vehicle fleet, bookings, maintenance, and customer relations.
            </p>
            <button
              onClick={() => navigate("/vehicles/dashboard")}
              className="flex items-center text-green-600 font-medium group"
            >
              Go to Dashboard
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start"
              >
                <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Ready to get started?</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/apartments/dashboard")}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              Manage Properties
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/vehicles/dashboard")}
              className="bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaCarAlt className="mr-2" />
              Manage Vehicles
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}