import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchContext } from '../Context/initialFetchContext';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addApartmentProperty } from '../APIS/APIS';
import ProcessingIndicator from '../Components/units/processingIndicator';
import { FiPlus, FiUser, FiHome, FiDollarSign, FiMapPin, FiInfo } from 'react-icons/fi';
import Select from 'react-select';

export default function AddPropertyPage() {
  const { apartments, tenants, loading, fetchApartments, fetchTenants, setLoading } = useContext(fetchContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    status: 'Available',
    description: '',
    tenants: []
  });
  const [selectedTenants, setSelectedTenants] = useState([]);

  // Format tenants for multi-select component
  const tenantOptions = tenants.map(tenant => ({
    value: tenant._id,
    label: `${tenant.tenantName} (${tenant.tenantPhone})`
  }));

  useEffect(() => {
    // Update formData tenants when selectedTenants changes
    setFormData(prev => ({
      ...prev,
      tenants: selectedTenants.map(t => t.value) // Corrected to use t.value
    }));
  }, [selectedTenants]);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting form data:', formData); // Debug log
      const response = await addApartmentProperty(formData);
      if (response.status === 200) {
        toast.success('Apartment Added Successfully');
        fetchApartments(); // Refresh apartments list
        navigate('/apartments/list');
      } else {
        toast.error(response.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting form:', error); // Debug log
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Sidebar */}
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Property</h1>
                <p className="text-gray-600">Fill in the details to register a new apartment</p>
              </div>
              <button 
                onClick={() => navigate('/apartments/list')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
              >
                View All Apartments
              </button>
            </div>

            {/* Form Card */}
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
                          name="title"
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Apartment Name"
                          required
                        />
                        <FiHome className="absolute left-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Location*</label>
                      <div className="relative">
                        <input
                          name="location"
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g. East Legon, Accra"
                          required
                        />
                        <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Price (GHC)*</label>
                      <div className="relative">
                        <input
                          name="price"
                          type="number"
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="e.g. 2500"
                          required
                        />
                        <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Status*</label>
                      <select
                        name="status"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.status}
                        onChange={handleChange}
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
                    
                    {tenants.length > 0 ? (
                      <Select
                        isMulti
                        options={tenantOptions}
                        value={selectedTenants}
                        onChange={setSelectedTenants}
                        placeholder="Select tenants..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            minHeight: '44px',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            '&:hover': {
                              borderColor: '#d1d5db'
                            }
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
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiInfo className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              No tenants available. You can assign tenants later after creating the apartment.
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the property features, amenities, etc."
                    ></textarea>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/apartments/list')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <ProcessingIndicator message="Saving..." />
                    ) : (
                      <>
                        <FiPlus className="mr-2" /> Add Property
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}