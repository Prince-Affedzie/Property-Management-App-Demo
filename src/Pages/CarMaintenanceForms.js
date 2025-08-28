import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';
import { getVehicles, addMaintenanceRecord } from '../APIS/APIS';
import Select from 'react-select';
import ProcessingIndicator from '../Components/units/processingIndicator';

export default function AddMaintenancePage() {
  const navigate = useNavigate();
  const [loading,setLoading] =useState()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    maintenanceDate: '',
    cost: '',
    issue: [''],
    status: 'pending'
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await getVehicles();
        if (res.status === 200) {
          setVehicles(res.data);
        }
      } catch (err) {
        toast.error('Error fetching vehicles');
      }
    };
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVehicleSelect = (selectedOption) => {
    setFormData({ ...formData, vehicleId: selectedOption ? selectedOption.value : '' });
  };

  const handleIssueChange = (index, value) => {
    const updated = [...formData.issue];
    updated[index] = value;
    setFormData({ ...formData, issue: updated });
  };

  const addIssueField = () => {
    setFormData({ ...formData, issue: [...formData.issue, ''] });
  };

  const removeIssueField = (index) => {
    const updated = formData.issue.filter((_, i) => i !== index);
    setFormData({ ...formData, issue: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      toast.info('Adding New Maintenance Record');
      const res = await addMaintenanceRecord(formData);
      if (res.status === 200) {
        toast.success('Maintenance record added');
        navigate('/vehicle/maintainance_list');
      } else {
        toast.error(res.message || 'Failed to add maintenance record');
      }
    } catch (err) {
      toast.error('Unexpected error occurred');
    }finally{
      setLoading(false)
    }
  };

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle._id,
    label: `${vehicle.make} ${vehicle.model} (${vehicle.vehicleRegNum})`
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer />
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />

      <div className="flex-1 flex flex-col">
       <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        <main className="flex-1 p-6 mt-16">
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Add Maintenance Record</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
                <Select
                  options={vehicleOptions}
                  onChange={handleVehicleSelect}
                  placeholder="Search or select a vehicle"
                  isClearable
                  value={vehicleOptions.find(option => option.value === formData.vehicleId) || null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Date</label>
                <input
                  type="date"
                  name="maintenanceDate"
                  value={formData.maintenanceDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issues</label>
                {formData.issue.map((val, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleIssueChange(i, e.target.value)}
                      placeholder="Issue description"
                      required
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.issue.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIssueField(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addIssueField} className="text-blue-600 hover:underline mt-1 text-sm">
                  + Add Issue
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700
                     ${loading ? 'opacity-70 scale-95 cursor-wait transition-all duration-300' : 'transition-all duration-300'}`}
                >
                   {loading ? <ProcessingIndicator message="Adding Payment..." /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
