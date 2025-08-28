import React, { useEffect, useState } from 'react';
import { getMaintenanceRecords, deleteMaintenanceRecord } from '../APIS/APIS';
import { Eye, Pencil, PlusCircle, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import exportToExcel from '../Utils/exportToExcel';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';

export default function MaintenanceListPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   const fields = [
    { key: 'vehicleId.model', label: 'Vehicle Model' },
    { key: 'vehicleId.make', label: 'Vehicle Make' },
    { key: 'maintenanceDate', label: 'Maintenance Date' },
    { key: 'cost', label: 'Maintenace Cost' },
    { key: 'issue', label: 'Issue' },
    { key: 'status', label: 'Status' }
    
  ];
  
  const recordsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await getMaintenanceRecords();
        if (response.status === 200) {
          setRecords(response.data);
        }
      } catch (err) {
        console.error('Error fetching maintenance records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        toast.info('Deletion ongoing')
        const response =await deleteMaintenanceRecord(id);
        if(response.status ===200){
          toast.success('Deletion Successful')
          setRecords((prev) => prev.filter((rec) => rec._id !== id));
        }
        else{
          toast.error('Unexpected error occurred')
        }
        
      } catch (error) {
        console.error('Delete failed', error);
        toast.error('Unexpected error occurred')
      }
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesStatus = filterStatus ? r.status === filterStatus : true;
    const matchesSearch = searchTerm
      ? r.vehicleId?.vehicleRegNum?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-x-hidden">
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
      <div className="flex-1">
       <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Maintenance Records</h1>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/vehicle/add_maintenance')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <PlusCircle size={18} /> Add Record
              </button>
               <button
                      onClick={() => exportToExcel(currentRecords, 'Vehicle_Maintenance_List',fields)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition lg:ml-3"
                        >
                      Export Maintenance List
                      </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-60 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search by Vehicle Reg. No</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter registration number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <p>Loading maintenance records...</p>
            ) : currentRecords.length === 0 ? (
              <p className="text-gray-500">No maintenance records found.</p>
            ) : (
              <>
                <div className="overflow-auto rounded shadow bg-white">
                  <table className="min-w-full table-auto divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vehicle Reg. No</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cost (GHC)</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Issues</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-800 whitespace-nowrap">{record.vehicleId?.vehicleRegNum}-{record.vehicleId?.make} ({record.vehicleId?.model})</td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{(new Date(record.maintenanceDate).toDateString())}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{record.cost}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <ul className="list-disc ml-4">
                              {record.issue.map((issue, i) => <li key={i}>{issue}</li>)}
                            </ul>
                          </td>
                          <td className="px-4 py-4 text-sm capitalize text-gray-700 whitespace-nowrap">{record.status}</td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <div className="flex gap-2">
                              <button onClick={() => setSelectedRecord(record)} className="text-blue-600 hover:text-blue-800" title="View">
                                <Eye size={16} />
                              </button>
                              <button onClick={() => navigate(`/vehicle/edit_maintenance_record/${record._id}`)} className="text-yellow-500 hover:text-yellow-600" title="Edit">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDelete(record._id)} className="text-red-600 hover:text-red-700" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center mt-6">
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedRecord && (
              <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-xl relative">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                  <h2 className="text-xl font-bold mb-4">Maintenance Details</h2>
                  <p><strong>Vehicle:</strong> {selectedRecord.vehicleId?.make}-{selectedRecord.vehicleId?.model} ({selectedRecord.vehicleId?.vehicleRegNum})</p>
                  <p><strong>Date:</strong> {new Date(selectedRecord.maintenanceDate).toDateString()}</p>
                  <p><strong>Maintenance Cost:</strong> GHC {selectedRecord.cost}</p>
                  <p><strong>Status:</strong> {selectedRecord.status}</p>
                  <div className="mt-2">
                    <strong>Issues:</strong>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {selectedRecord.issue.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
