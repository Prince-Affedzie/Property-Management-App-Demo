import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import { addVehicleRecord } from '../APIS/APIS';
import ProcessingIndicator from '../Components/units/processingIndicator';
import { useDrivers } from '../Context/DriverContext';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';


export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { drivers, fetchDrivers } = useDrivers();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(true);

  const [formData, setFormData] = useState({
    vehiceType: '',
    make: '',
    model: '',
    vehicleRegNum: '',
    chassisNum: '',
    maintenanceHist: [{ hist: '', cost: '', date: '', status: 'completed' }],
    driver: ''
  });

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        await fetchDrivers();
      } catch (error) {
        console.error('Error loading drivers:', error);
        toast.error('Failed to load drivers');
      } finally {
        setDriversLoading(false);
      }
    };

    loadDrivers();
  }, [fetchDrivers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaintenanceChange = (index, field, value) => {
    const updatedHist = [...formData.maintenanceHist];
    
    // Convert cost to number if it's the cost field
    if (field === 'cost') {
      updatedHist[index][field] = value === '' ? 0 : Number(value);
    } else {
      updatedHist[index][field] = value;
    }
    
    setFormData((prev) => ({ ...prev, maintenanceHist: updatedHist }));
  };

  const addMaintenanceField = () => {
    setFormData((prev) => ({
      ...prev,
      maintenanceHist: [...prev.maintenanceHist, { hist: '', cost: '', date: '', status: 'completed' }],
    }));
  };

  const removeMaintenanceField = (index) => {
    if (formData.maintenanceHist.length > 1) {
      const updatedHist = formData.maintenanceHist.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, maintenanceHist: updatedHist }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addVehicleRecord(formData);
      if (response.status === 200) {
        toast.success('Vehicle record added successfully');
        navigate('/vehicles/list');
      } else {
        toast.error(response.message || 'An error occurred.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Unexpected error occurred';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <ToastContainer position="top-center" autoClose={3000} />
      <VehicleSidebar
        toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="flex-1 flex flex-col w-full">
        <VehicleTopNav
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
          className="sticky top-0 z-30 bg-white shadow-md"
        />
       
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Add New Vehicle Record</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Type */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                <select
                  name="vehiceType"
                  value={formData.vehiceType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="commercial car">Commercial Car</option>
                  <option value="luxury car">Luxury Car</option>
                  <option value="taxi">Taxi</option>
                  <option value="truck">Truck</option>
                  <option value="bus">Bus</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Details */}
                <div className="w-full space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                    <input
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                    <input
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                    <input
                      name="vehicleRegNum"
                      value={formData.vehicleRegNum}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number *</label>
                    <input
                      name="chassisNum"
                      value={formData.chassisNum}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Selection */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                <select
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={driversLoading}
                >
                  <option value="">Select a driver (optional)</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                    </option>
                  ))}
                </select>
                {driversLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading drivers...</p>
                )}
              </div>

              {/* Maintenance History */}
              <div className="w-full pt-2">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium">Maintenance History</h2>
                  <button
                    type="button"
                    onClick={addMaintenanceField}
                    className="text-xs sm:text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition duration-300"
                  >
                    + Add Record
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.maintenanceHist.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Maintenance Detail</label>
                          <input
                            type="text"
                            placeholder="e.g., Oil Change"
                            value={item.hist}
                            onChange={(e) => handleMaintenanceChange(index, 'hist', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Cost (GHS)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={item.cost}
                            onChange={(e) => handleMaintenanceChange(index, 'cost', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => handleMaintenanceChange(index, 'date', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={item.status}
                            onChange={(e) => handleMaintenanceChange(index, 'status', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ongoing">Ongoing</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      {formData.maintenanceHist.length > 1 && (
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeMaintenanceField(index)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={loading}
                  type="submit"
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 text-sm font-medium
                    ${loading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loading ? <ProcessingIndicator message="Adding Record..." /> : 'Save Vehicle Record'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}