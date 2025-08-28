import React, { useState } from "react";
import { useDrivers } from "../Context/DriverContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../APIS/APIS";
import VehicleSidebar from "../Components/Layout/VehicleSidebar";
import VehicleTopNav from "../Components/Layout/VehicleTopNavBar";
export default function DriversPage() {
  const { drivers, loading, addDriver, removeDriver, editDriver } = useDrivers();
  const [newDriver, setNewDriver] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    licenseNumber: "",
    licenseExpiry: "",
    isActive: true
  });
  const [editingDriver, setEditingDriver] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await addDriver(newDriver);
      setNewDriver({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        licenseNumber: "",
        licenseExpiry: "",
        isActive: true
      });
      setShowForm(false);
      toast.success("Driver added successfully!");
    } catch (error) {
      toast.error("Failed to add driver");
    }
  };

  const handleEditDriver = (driver) => {
    // Format the date for the date input field (YYYY-MM-DD)
    const formattedDriver = {
      ...driver,
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : ""
    };
    setEditingDriver(formattedDriver);
    setShowForm(true);
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    try {
      // Extract only the fields that can be updated
      const { _id, firstName, lastName, phone, address, licenseNumber, licenseExpiry, isActive } = editingDriver;
      
      await editDriver(_id, {
        firstName,
        lastName,
        phone,
        address,
        licenseNumber,
        licenseExpiry,
        isActive
      });
      
      setEditingDriver(null);
      setShowForm(false);
      toast.success("Driver updated successfully!");
    } catch (error) {
      toast.error("Failed to update driver");
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await removeDriver(driverId);
        toast.success("Driver deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete driver");
      }
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && driver.isActive;
    if (activeTab === "inactive") return matchesSearch && !driver.isActive;
    
    return matchesSearch;
  });

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span> : 
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const activeDrivers = drivers.filter(d => d.isActive).length;
  const inactiveDrivers = drivers.filter(d => !d.isActive).length;

  // Check for drivers with expired licenses
  const expiredLicenses = drivers.filter(driver => {
    if (!driver.licenseExpiry) return false;
    return new Date(driver.licenseExpiry) < new Date();
  }).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
       <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Driver Management</h1>
            <button 
              className="flex items-center px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              onClick={() => {
                setEditingDriver(null);
                setShowForm(true);
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Driver
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats and Search */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-800">{drivers.length}</h2>
                  <p className="text-sm text-gray-500">Total Drivers</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-800">{activeDrivers}</h2>
                  <p className="text-sm text-gray-500">Active Drivers</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-800">{inactiveDrivers}</h2>
                  <p className="text-sm text-gray-500">Inactive Drivers</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-800">{expiredLicenses}</h2>
                  <p className="text-sm text-gray-500">Expired Licenses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-start justify-between mb-4 space-y-4 md:flex-row md:items-center md:space-y-0">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Drivers
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'active' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'inactive' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('inactive')}
                >
                  Inactive
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Drivers Table Container with Horizontal Scroll */}
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading drivers...</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Driver</th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Contact</th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">License</th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Expiry Date</th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDrivers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 极狐 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-4 text-gray-600">No drivers found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredDrivers.map((driver) => {
                          const isLicenseExpired = driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date();
                          
                          return (
                            <tr key={driver._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-10 h-10">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                      <span className="font-medium text-blue-800">{driver.firstName.charAt(0)}{driver.lastName.charAt(0)}</span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900">{driver.firstName} {driver.lastName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">{driver.phone}</div>
                                {driver.address && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{driver.address}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-900">{driver.licenseNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`${isLicenseExpired ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                  {formatDate(driver.licenseExpiry)}
                                  {isLicenseExpired && (
                                    <span className="ml-1 text-xs text-red-500">(Expired)</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(driver.isActive)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                <button
                                  className="p-2 mr-2 text-blue-600 transition-colors duration-200 rounded-full hover:bg-blue-100"
                                  onClick={() => handleEditDriver(driver)}
                                  title="Edit driver"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  className="p-2 text-red-600 transition-colors duration-200 rounded-full hover:bg-red-100"
                                  onClick={() => handleDeleteDriver(driver._id)}
                                  title="Delete driver"
                                >
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Driver Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:align-middle sm:max-w-lg">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowForm(false)}
                >
                  <svg className="w-6 h极狐-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingDriver ? handleUpdateDriver : handleAddDriver} className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.firstName : newDriver.firstName}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, firstName: e.target.value}) :
                        setNewDriver({...newDriver, firstName: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text极狐-sm font-medium text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.lastName : newDriver.lastName}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, lastName: e.target.value}) :
                        setNewDriver({...newDriver, lastName: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.phone : newDriver.phone}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, phone: e.target.value}) :
                        setNewDriver({...newDriver, phone: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">License Number *</label>
                    <input
                      type="text"
                      id="licenseNumber"
                      className="block w-full mt极狐-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500极狐 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.licenseNumber : newDriver.licenseNumber}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, licenseNumber: e.target.value}) :
                        setNewDriver({...newDriver, licenseNumber: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700">License Expiry *</label>
                    <input
                      type="date"
                      id="licenseExpiry"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.licenseExpiry : newDriver.licenseExpiry}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, licenseExpiry: e.target.value}) :
                        setNewDriver({...newDriver, licenseExpiry: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="status"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.isActive : newDriver.isActive}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, isActive: e.target.value === 'true'}) :
                        setNewDriver({...newDriver, isActive: e.target.value === 'true'})
                      }
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
                    <textarea
                      id="address"
                      rows={3}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editingDriver ? editingDriver.address : newDriver.address}
                      onChange={(e) => editingDriver ? 
                        setEditingDriver({...editingDriver, address: e.target.value}) :
                        setNewDriver({...newDriver, address: e.target.value})
                      }
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingDriver ? 'Update Driver' : 'Add Driver'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray极狐-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}