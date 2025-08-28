import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft,FiInfo, FiUser, FiPhone, FiHome, FiCalendar, FiDollarSign, FiCheck } from 'react-icons/fi';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { fetchTenantRecord, editTenant } from '../APIS/APIS';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProcessingIndicator from '../Components/units/processingIndicator';
import { fetchContext } from '../Context/initialFetchContext';
import Select from 'react-select';
import StatusBadge from '../Components/units/StatusBadge';

export default function EditTenantPage() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const { apartments } = useContext(fetchContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [currentApartment, setCurrentApartment] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);

  const [formData, setFormData] = useState({
    tenantName: '',
    tenantPhone: '',
    roomDescription: '',
    rentedDate: '',
    apartment: null,
    expirationDate: '',
    noOfMonthsRented: '',
    amountPaidOnUtility: '',
    monthlyPrice: '',
    totalAmount: '',
    status: 'Active',
  });

  // Format apartments for select component
  const apartmentOptions = apartments.map(apt => ({
    value: apt._id,
    label: `${apt.title} - ${apt.location}`,
    status: apt.status
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchTenantRecord(Id);
        
        if (response.status === 200) {
          const tenant = response.data;
          const currentApt = apartments.find(a => a._id === tenant.apartment._id);
          
          setCurrentApartment(currentApt);
          setSelectedApartment(currentApt ? { 
            value: currentApt._id, 
            label: `${currentApt.title} - ${currentApt.location}`,
            status: currentApt.status
          } : null);

          setFormData({
            ...tenant,
            rentedDate: tenant.rentedDate?.substring(0, 10) || '',
            expirationDate: tenant.expirationDate?.substring(0, 10) || '',
          });
        } else {
          toast.error('Failed to load tenant data');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tenant data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [Id, apartments]);

  useEffect(() => {
    if (formData.monthlyPrice && formData.noOfMonthsRented && formData.amountPaidOnUtility) {
      const total = parseFloat(formData.monthlyPrice) * parseFloat(formData.noOfMonthsRented) + 
                   parseFloat(formData.amountPaidOnUtility);
      setFormData(prev => ({ ...prev, totalAmount: total.toFixed(2) }));
    }
  }, [formData.monthlyPrice, formData.noOfMonthsRented, formData.amountPaidOnUtility]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApartmentChange = (selectedOption) => {
    setSelectedApartment(selectedOption);
    setFormData(prev => ({ ...prev, apartment: selectedOption?.value || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const response = await editTenant(Id, formData);
      if (response.status === 200) {
        toast.success('Tenant updated successfully!');
        navigate('/apartments/tenants');
      } else {
        toast.error(response.error || "Failed to update tenant");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Failed to update tenant";
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const inputFields = [
    { label: 'Tenant Name', name: 'tenantName', type: 'text', icon: <FiUser /> },
    { label: 'Phone Number', name: 'tenantPhone', type: 'tel', icon: <FiPhone />, placeholder: '+233XXXXXXXXX' },
    { label: 'Room Description', name: 'roomDescription', type: 'text', icon: <FiHome /> },
    { label: 'Rented Date', name: 'rentedDate', type: 'date', icon: <FiCalendar /> },
    { label: 'Expiration Date', name: 'expirationDate', type: 'date', icon: <FiCalendar /> },
    { label: 'Months Rented', name: 'noOfMonthsRented', type: 'number', icon: <FiCalendar /> },
    { label: 'Utility Amount (GHC)', name: 'amountPaidOnUtility', type: 'number', icon: <FiDollarSign /> },
    { label: 'Monthly Price (GHC)', name: 'monthlyPrice', type: 'number', icon: <FiDollarSign /> },
    { label: 'Total Amount (GHC)', name: 'totalAmount', type: 'number', icon: <FiDollarSign />, readOnly: true }
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
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FiArrowLeft className="mr-2" /> Back to Tenants
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Edit Tenant</h1>
            </div>

            {/* Current Apartment Card */}
            {currentApartment && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <FiHome className="mr-2" /> Current Apartment Assignment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Apartment</p>
                    <p className="font-medium">{currentApartment.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Location</p>
                    <p className="font-medium">{currentApartment.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Status</p>
                    <StatusBadge status={currentApartment.status} />
                  </div>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Tenant Information Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FiUser className="mr-2" /> Tenant Information
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              value={formData[name] || ''}
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              value={formData[name] || ''}
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                              value={formData[name] || ''}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Amount */}
                      <div className="space-y-1 sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">{inputFields[8].label}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {inputFields[8].icon}
                          </div>
                          <input
                            name={inputFields[8].name}
                            type={inputFields[8].type}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            value={formData.totalAmount || ''}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Apartment Assignment Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FiHome className="mr-2" /> Change Apartment Assignment
                    </h2>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select New Apartment
                      </label>
                      
                      {apartments.length > 0 ? (
                        <Select
                          options={apartmentOptions}
                          value={selectedApartment}
                          onChange={handleApartmentChange}
                          placeholder="Select new apartment..."
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
                      onClick={() => navigate(-1)}
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
                        <ProcessingIndicator message="Saving Changes..." />
                      ) : (
                        <>
                          <FiCheck className="mr-2" /> Update Tenant
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}