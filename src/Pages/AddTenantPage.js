import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchContext } from '../Context/initialFetchContext';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addTenantRecord } from '../APIS/APIS';
import ProcessingIndicator from '../Components/units/processingIndicator';
import { 
  FiUser,FiInfo, FiPhone, FiHome, FiCalendar, FiDollarSign, 
  FiClock, FiPlus, FiArrowLeft, FiCheck 
} from 'react-icons/fi';
import Select from 'react-select';

export default function AddTenantPage() {
  const navigate = useNavigate();
  const { apartments, loading, fetchApartments } = useContext(fetchContext);
  const [formLoading, setFormLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTotalAmountFocused, setIsTotalAmountFocused] = useState(false);
  
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantPhone: '',
    roomDescription: '',
    rentedDate: '',
    expirationDate: '',
    noOfMonthsRented: '',
    amountPaidOnUtility: '',
    monthlyPrice: '',
    totalAmount: '',
    status: 'Active',
    apartment: null
  });

  // Format apartments for select component
  const apartmentOptions = apartments.map(apartment => ({
    value: apartment._id,
    label: `${apartment.title} - ${apartment.location} (${apartment.status})`
  }));

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApartmentChange = (selectedOption) => {
    setFormData(prev => ({ 
      ...prev, 
      apartment: selectedOption ? selectedOption.value : null 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      // Validate apartment selection
      if (!formData.apartment) {
        toast.error('Please select an apartment for this tenant');
        return;
      }

      const response = await addTenantRecord(formData);
      if (response.status === 200) {
        toast.success('Tenant added successfully!');
        navigate('/apartments/tenants');
      } else {
        toast.error(response.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    if (!isTotalAmountFocused && formData.noOfMonthsRented && formData.monthlyPrice && formData.amountPaidOnUtility) {
      const calculatedTotal = parseFloat(formData.noOfMonthsRented) * parseFloat(formData.monthlyPrice) + parseFloat(formData.amountPaidOnUtility);
      setFormData(prev => ({
        ...prev,
        totalAmount: isNaN(calculatedTotal) ? '' : calculatedTotal.toFixed(2),
      }));
    }
  }, [formData.noOfMonthsRented, formData.monthlyPrice, formData.amountPaidOnUtility, isTotalAmountFocused]);

  const inputFields = [
    { label: 'Tenant Name', name: 'tenantName', type: 'text', icon: <FiUser /> },
    { label: 'Phone Number', name: 'tenantPhone', type: 'tel', icon: <FiPhone />, placeholder: '+233XXXXXXXXX' },
    { label: 'Room Description', name: 'roomDescription', type: 'text', icon: <FiHome /> },
    { label: 'Rented Date', name: 'rentedDate', type: 'date', icon: <FiCalendar /> },
    { label: 'Expiration Date', name: 'expirationDate', type: 'date', icon: <FiCalendar /> },
    { label: 'Months Rented', name: 'noOfMonthsRented', type: 'number', icon: <FiClock /> },
    { label: 'Utility Amount (GHC)', name: 'amountPaidOnUtility', type: 'number', icon: <FiDollarSign /> },
    { label: 'Monthly Price (GHC)', name: 'monthlyPrice', type: 'number', icon: <FiDollarSign /> },
    { label: 'Total Amount (GHC)', name: 'totalAmount', type: 'number', icon: <FiDollarSign /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Tenant</h1>
                <p className="text-gray-600">Register a new tenant and assign to an apartment</p>
              </div>
              <button
                onClick={() => navigate('/apartments/tenants')}
                className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
              >
                <FiArrowLeft className="mr-2" /> Back to Tenants
              </button>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Tenant Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiUser className="mr-2" /> Tenant Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inputFields.slice(0, 3).map(({ label, name, type, icon, placeholder }) => (
                      <div key={name} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">{label}*</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                          </div>
                          <input
                            name={name}
                            type={type}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData[name]}
                            placeholder={placeholder}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rental Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiCalendar className="mr-2" /> Rental Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inputFields.slice(3, 5).map(({ label, name, type, icon }) => (
                      <div key={name} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">{label}*</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                          </div>
                          <input
                            name={name}
                            type={type}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData[name]}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiDollarSign className="mr-2" /> Financial Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {inputFields.slice(5, 8).map(({ label, name, type, icon }) => (
                      <div key={name} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">{label}*</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                          </div>
                          <input
                            name={name}
                            type={type}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData[name]}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Amount */}
                    <div className="space-y-1 md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">{inputFields[8].label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          {inputFields[8].icon}
                        </div>
                        <input
                          name={inputFields[8].name}
                          type={inputFields[8].type}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.totalAmount}
                          onChange={handleChange}
                          onFocus={() => setIsTotalAmountFocused(true)}
                          onBlur={() => setIsTotalAmountFocused(false)}
                          readOnly={!isTotalAmountFocused}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apartment Assignment Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiHome className="mr-2" /> Apartment Assignment
                  </h2>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Assign to Apartment*
                    </label>
                    
                    {loading ? (
                      <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    ) : apartments.length > 0 ? (
                      <Select
                        options={apartmentOptions}
                        onChange={handleApartmentChange}
                        placeholder="Select apartment..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
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
                          singleValue: (provided) => ({
                            ...provided,
                            color: '#1f2937'
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
                              No apartments available. Please add apartments first.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiCheck className="mr-2" /> Status
                  </h2>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Tenant Status*</label>
                    <select
                      name="status"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/apartments/tenants')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center ${
                      formLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <ProcessingIndicator message="Saving Tenant..." />
                    ) : (
                      <>
                        <FiPlus className="mr-2" /> Add Tenant
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