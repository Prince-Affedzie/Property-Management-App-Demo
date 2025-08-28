import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSingleMaintenanceRecord, updateMaintenanceRecord, getVehicles } from '../APIS/APIS';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';

export default function EditMaintenancePage() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordRes, vehiclesRes] = await Promise.all([
          getSingleMaintenanceRecord(Id),
          getVehicles()
        ]);
        if (recordRes.status === 200) setRecord(recordRes.data);
        if (vehiclesRes.status === 200) setVehicles(vehiclesRes.data);
      } catch (error) {
        console.error('Error fetching data', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleIssueChange = (index, value) => {
    const updated = [...record.issue];
    updated[index] = value;
    setRecord((prev) => ({ ...prev, issue: updated }));
  };

  const addIssueField = () => {
    setRecord((prev) => ({ ...prev, issue: [...prev.issue, ''] }));
  };

  const removeIssueField = (index) => {
    const updated = record.issue.filter((_, i) => i !== index);
    setRecord((prev) => ({ ...prev, issue: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        toast.info('Processing your update')
      const response = await updateMaintenanceRecord(Id, record);
      if (response.status === 200) {
        toast.success('Maintenance record updated');
        navigate('/vehicle/maintainance_list');
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      toast.error('Unexpected error occurred');
    }
  };

  if (loading || !record) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <ToastContainer />
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1">
        <TopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        <main className="p-6 mt-16">
          <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Edit Maintenance Record</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  name="vehicleId"
                  value={record.vehicleId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded"
                >
                  {record.vehicleId && !vehicles.find((v) => v._id === record.vehicleId) && (
                    <option value={record.vehicleId}>
                     {record.vehicleId.make}-{record.vehicleId.model}
                    </option>
                  )}
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} - {v.model} ({v.vehicleRegNum})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Date</label>
                <input
                  type="date"
                  name="maintenanceDate"
                  value={record.maintenanceDate?.substring(0, 10)}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost (GHC)</label>
                <input
                  type="number"
                  name="cost"
                  value={record.cost}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={record.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issues</label>
                {record.issue.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleIssueChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeIssueField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addIssueField} className="text-blue-500 hover:underline text-sm mt-2">
                  + Add Issue
                </button>
              </div>

              <div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Update Maintenance
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
