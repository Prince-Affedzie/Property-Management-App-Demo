import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import { getSingleVehicle, updateVehicle } from '../APIS/APIS';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Trash2 } from 'lucide-react';
import { useDrivers } from '../Context/DriverContext';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';


export default function EditVehiclePage() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const { drivers, fetchDrivers } = useDrivers();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  const [formData, setFormData] = useState({
    vehiceType: '',
    make: '',
    model: '',
    vehicleRegNum: '',
    chassisNum: '',
    driver: '',
    maintenanceHist: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setDriversLoading(true);
        
        // Load drivers and vehicle data in parallel
        await Promise.all([
          fetchDrivers(),
          (async () => {
            const response = await getSingleVehicle(Id);
            if (response.status === 200) {
              const vehicle = response.data;
              // Ensure maintenanceHist has all required fields
              vehicle.maintenanceHist = vehicle.maintenanceHist?.map(m => ({
                hist: m.hist || '',
                cost: m.cost || 0,
                date: m.date ? m.date.substring(0, 10) : '',
                status: m.status || 'completed'
              })) || [];
              setFormData(vehicle);
            } else {
              toast.error('Failed to load vehicle data');
            }
          })()
        ]);
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching data');
      } finally {
        setLoading(false);
        setDriversLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMaintenanceChange = (index, field, value) => {
    const updated = [...formData.maintenanceHist];
    
    // Convert cost to number if it's the cost field
    if (field === 'cost') {
      updated[index][field] = value === '' ? 0 : Number(value);
    } else {
      updated[index][field] = value;
    }
    
    setFormData((prev) => ({ ...prev, maintenanceHist: updated }));
  };

  const addMaintenance = () => {
    setFormData((prev) => ({
      ...prev,
      maintenanceHist: [...prev.maintenanceHist, { hist: '', cost: '', date: '', status: 'completed' }]
    }));
  };

  const removeMaintenance = (index) => {
    const updated = formData.maintenanceHist.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, maintenanceHist: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateVehicle(Id, formData);
      if (response.status === 200) {
        toast.success('Vehicle updated successfully');
        navigate('/vehicles/list');
      } else {
        toast.error(response.data?.error || 'Update failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unexpected error';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
              <h1 className="text-2xl font-bold mb-6">Edit Vehicle</h1>
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer />
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1">
        <TopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <main className="p-6 mt-16">
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Edit Vehicle</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select 
                    name="vehiceType" 
                    value={formData.vehiceType} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="commercial car">Commercial Car</option>
                    <option value="luxury car">Luxury Car</option>
                    <option value="taxi">Taxi</option>
                    <option value="truck">Truck</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                  <input 
                    name="make" 
                    value={formData.make} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input 
                    name="model" 
                    value={formData.model} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Registration Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                  <input 
                    name="vehicleRegNum" 
                    value={formData.vehicleRegNum} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Chassis Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number *</label>
                  <input 
                    name="chassisNum" 
                    value={formData.chassisNum} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              {/* Maintenance History */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Maintenance History</h2>
                {formData.maintenanceHist.map((entry, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Maintenance Description"
                        value={entry.hist || ''}
                        onChange={(e) => handleMaintenanceChange(idx, 'hist', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cost (GHS)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={entry.cost || ''}
                        onChange={(e) => handleMaintenanceChange(idx, 'cost', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={entry.date || ''}
                        onChange={(e) => handleMaintenanceChange(idx, 'date', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={entry.status || 'completed'}
                          onChange={(e) => handleMaintenanceChange(idx, 'status', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ongoing">Ongoing</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeMaintenance(idx)} 
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove maintenance entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addMaintenance} 
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  + Add Maintenance Entry
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  Update Vehicle
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}