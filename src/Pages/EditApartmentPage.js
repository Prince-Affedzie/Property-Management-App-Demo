import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchContext } from '../Context/initialFetchContext';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { getSingleApartment, updateApartment } from '../APIS/APIS';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProcessingIndicator from '../Components/units/processingIndicator';
import { FiHome, FiMapPin, FiDollarSign, FiInfo, FiUser, FiSave, FiArrowLeft, FiUsers, FiPhone, FiMail } from 'react-icons/fi';
import Select from 'react-select';

export default function EditApartmentPage() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const { tenants, loading: tenantsLoading, fetchTenants } = useContext(fetchContext);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    status: 'Available',
    tenants: []
  });
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [currentTenants, setCurrentTenants] = useState([]);

  // Format tenants for multi-select component
  const tenantOptions = tenants?.map(tenant => ({
    value: tenant._id,
    label: `${tenant.tenantName} (${tenant.tenantPhone})`,
    ...tenant
  })) || [];

 useEffect(() => {
  const fetchApartment = async () => {
    try {
      setLoading(true);
      const response = await getSingleApartment(Id);
      
      if (response.status === 200) {
        const apartmentData = response.data;
        setFormData(apartmentData);
        
        // Set current tenants directly from apartment data
        // Assuming apartmentData.tenants contains full tenant objects
        setCurrentTenants(apartmentData.tenants || []);
        
        // Set selected tenants for the multi-select
        const selected = apartmentData.tenants?.map(tenant => ({
          value: tenant._id,
          label: `${tenant.tenantName} (${tenant.tenantPhone})`
        })) || [];
        
        setSelectedTenants(selected);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load apartment data');
    } finally {
      setLoading(false);
    }
  };

  fetchApartment();
}, [Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTenantChange = (selectedOptions) => {
    setSelectedTenants(selectedOptions);
    // Update formData tenants with just the IDs
    setFormData(prev => ({
      ...prev,
      tenants: selectedOptions.map(option => option.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      // Prepare the data to send
      const updateData = {
        ...formData,
        // Ensure we're only sending the tenant IDs
        tenants: selectedTenants.map(t => t.value)
      };

      const response = await updateApartment(Id, updateData);
      if (response.status === 200) {
        toast.success('Apartment updated successfully');
        navigate('/apartments/list');
      } else {
        toast.error(response.data?.error || 'Update failed.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unexpected error.';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <div className="flex bg-gray-50 h-screen">
      <ToastContainer position="top-right" autoClose={5000} />
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Edit Apartment</h1>
                <p className="text-gray-600">Update the details of this property</p>
              </div>
              <button
                onClick={() => navigate('/apartments/list')}
                className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
              >
                <FiArrowLeft className="mr-2" /> Back to List
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Loading Skeleton */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md p-6 space-y-4 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
                    ))}
                  </div>
                </div>
                {/* Sidebar Loading Skeleton */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form - Takes 2/3 of the space on large screens */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                          <FiHome className="mr-2" /> Basic Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Title */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Title*</label>
                            <div className="relative">
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Apartment Name"
                              />
                              <FiHome className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>

                          {/* Location */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Location*</label>
                            <div className="relative">
                              <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="e.g. East Legon, Accra"
                              />
                              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>

                          {/* Price */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Price (GHC)*</label>
                            <div className="relative">
                              <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="e.g. 2500"
                              />
                              <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                            </div>
                          </div>

                          {/* Status */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Status*</label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="Available">Available</option>
                              <option value="Occupied">Occupied</option>
                              <option value="Maintenance">Under Maintenance</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Tenant Assignment Section */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                          <FiUser className="mr-2" /> Tenant Assignment
                        </h2>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Assign Tenants (Optional)
                          </label>
                          
                          {tenantsLoading ? (
                            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          ) : tenants.length > 0 ? (
                            <Select
                              isMulti
                              options={tenantOptions}
                              value={selectedTenants}
                              onChange={handleTenantChange}
                              placeholder="Select tenants..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.label}
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  minHeight: '44px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '0.5rem',
                                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                                  '&:hover': {
                                    borderColor: '#9ca3af'
                                  },
                                  transition: 'all 0.2s ease'
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                                  color: state.isSelected ? 'white' : '#1f2937',
                                  '&:active': {
                                    backgroundColor: '#3b82f6',
                                    color: 'white'
                                  }
                                }),
                                multiValue: (provided) => ({
                                  ...provided,
                                  backgroundColor: '#e0e7ff',
                                  borderRadius: '0.375rem'
                                }),
                                multiValueLabel: (provided) => ({
                                  ...provided,
                                  color: '#1e40af'
                                }),
                                multiValueRemove: (provided) => ({
                                  ...provided,
                                  color: '#1e40af',
                                  ':hover': {
                                    backgroundColor: '#bfdbfe',
                                    color: '#1e3a8a'
                                  }
                                })
                              }}
                            />
                          ) : (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <FiInfo className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-yellow-700">
                                    No tenants available. You can assign tenants later.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description Section */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                          <FiInfo className="mr-2" /> Description
                        </h2>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Additional Details
                          </label>
                          <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            placeholder="Describe the property features, amenities, etc."
                          ></textarea>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => navigate('/apartments/list')}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          disabled={formLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center ${
                            formLoading ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                          disabled={formLoading}
                        >
                          {formLoading ? (
                            <ProcessingIndicator message="Saving..." />
                          ) : (
                            <>
                              <FiSave className="mr-2" /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Current Tenants Sidebar - Takes 1/3 of the space on large screens */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <FiUsers className="mr-2 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Current Tenants</h3>
                        {currentTenants.length > 0 && (
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {currentTenants.length}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {currentTenants.length > 0 ? (
                          currentTenants.map(tenant => (
                            <div 
                              key={tenant._id} 
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {tenant.tenantName}
                                  </p>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <FiPhone className="w-3 h-3 mr-1" />
                                    <span className="truncate">{tenant.tenantPhone}</span>
                                  </div>
                                  {tenant.tenantEmail && (
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <FiMail className="w-3 h-3 mr-1" />
                                      <span className="truncate">{tenant.tenantEmail}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FiUsers className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-2">No tenants assigned</p>
                            <p className="text-xs text-gray-400">
                              This apartment is currently vacant
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quick Info */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                            Quick Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${
                                formData.status === 'Available' ? 'text-green-600' :
                                formData.status === 'Occupied' ? 'text-blue-600' : 'text-yellow-600'
                              }`}>
                                {formData.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium text-gray-900">
                                GHC {formData.price ? Number(formData.price).toLocaleString() : '0'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Capacity:</span>
                              <span className="font-medium text-gray-900">
                                {currentTenants.length} tenant{currentTenants.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}