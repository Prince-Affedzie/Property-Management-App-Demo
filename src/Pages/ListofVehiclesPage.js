import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getVehicles,deleteVehicleRecord} from '../APIS/APIS';
import { Car, Truck, BusFront, Users, Phone, MapPin, CalendarCheck2, Eye, Pencil, Trash2, X } from 'lucide-react';
import exportToExcel from '../Utils/exportToExcel';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';

export default function VehicleListPage() {
   

  const fields = [
    { key: 'vehiceType', label: 'Vehicle Type' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'vehicleRegNum', label: 'Registration Number' },
    { key: 'chassisNum', label: 'Chassis Number' },
    { key: 'driverName', label: 'Driver Name' },
    { key: 'contactDetails.phone', label: 'Driver Contact Details' },
    { key: 'contactDetails.location', label: 'Driver Location Details' },
    { key: 'licenseNum', label: 'Lincense Number' },
    { key: 'licenseType', label: 'Lincense Type' },
    { key: 'licenseNumExp', label: 'Lincense Expiry Date' },
   
  
    
  ];
  




  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterType, setFilterType] = useState('');
  const vehiclesPerPage = 6;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles();
        if (response.status === 200) {
          setVehicles(response.data);
        } else {
          setVehicles([]);
        }
      } catch (err) {
        console.error(err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this record?')) {
        try {
          toast.info('Deletion ongoing')
          const response =await deleteVehicleRecord(id);
          if(response.status ===200){
            toast.success('Deletion Successful')
            setVehicles((prev) => prev.filter((rec) => rec._id !== id));
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

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'truck': return <Truck size={18} />;
      case 'bus': return <BusFront size={18} />;
      default: return <Car size={18} />;
    }
  };

  const filteredVehicles = filterType
    ? vehicles.filter((v) => v.vehiceType === filterType)
    : vehicles;

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Vehicle Records</h1>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm"
              >
                <option value="">All Types</option>
                <option value="commercial car">Commercial Car</option>
                <option value="luxury car">Luxury Car</option>
                <option value="taxi">Taxi</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
              </select>
              <button
                onClick={() => navigate('/vehicle/add_record')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                + Add Vehicle
              </button>
               <button
                       onClick={() => exportToExcel(vehicles, 'Vehicle_List',fields)}
                       className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition lg:ml-3"
                       >
                       Export Vehicle List
                </button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg shadow animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : currentVehicles.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 text-lg">No vehicle records found.</div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentVehicles.map((vehicle) => (
                  <div key={vehicle._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        {getVehicleIcon(vehicle.vehiceType)}
                        <span className="capitalize">{vehicle.vehiceType}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">{vehicle.vehicleRegNum}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1"><strong>Make:</strong> {vehicle.make}</p>
                    <p className="text-sm text-gray-700 mb-1"><strong>Model:</strong> {vehicle.model}</p>
                    <p className="text-sm text-gray-700 mb-1"><strong>Chassis:</strong> {vehicle.chassisNum}</p>
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-1"><Users size={14} /> <strong>Driver:</strong> {vehicle.driver?.firstName || 'N/A'}</p>
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-1"><Phone size={14} /> {vehicle.driver?.phone || 'N/A'}</p>
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14} /> {vehicle.driver?.address  || 'N/A'}</p>
                    <p className="text-sm text-gray-700 mb-1"><strong>License:</strong> {vehicle.licenseNum} ({vehicle.licenseType})</p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <CalendarCheck2 size={14} /> Exp: {new Date(vehicle.licenseNumExp).toLocaleDateString()}
                    </p>
                    <div className="text-xs mt-2 text-gray-500 italic">
                      {vehicle.maintenanceHist?.length > 0 ? `${vehicle.maintenanceHist.length} maintenance record(s)` : 'No maintenance history'}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button title="View" onClick={() => setSelectedVehicle(vehicle)} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
                      <button title="Edit" className="text-yellow-600 hover:text-yellow-700"><Pencil size={16} onClick={() => navigate(`/vehicle/edit_record/${vehicle._id}`)} /></button>
                      <button title="Delete" className="text-red-600 hover:text-red-700" onClick={()=>handleDelete(vehicle._id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedVehicle && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-xl relative">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
                <p><strong>Type:</strong> {selectedVehicle.vehiceType}</p>
                <p><strong>Make:</strong> {selectedVehicle.make}</p>
                <p><strong>Model:</strong> {selectedVehicle.model}</p>
                <p><strong>Reg. Number:</strong> {selectedVehicle.vehicleRegNum}</p>
                <p><strong>Chassis:</strong> {selectedVehicle.chassisNum}</p>
                <p><strong>Driver:</strong> {selectedVehicle.driver?.firstName || 'N/a'}</p>
                <p><strong>Phone:</strong> {selectedVehicle.driver?.phone || 'N/a'}</p>
                <p><strong>Location:</strong> {selectedVehicle.driver?.address || 'N/a'}</p>
                <p><strong>License:</strong> {selectedVehicle.licenseNum} ({selectedVehicle.licenseType})</p>
                <p><strong>License Expiry:</strong> {new Date(selectedVehicle.licenseNumExp).toLocaleDateString()}</p>
                <div className="mt-2">
                  <strong>Maintenance History:</strong>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {selectedVehicle.maintenanceHist?.length > 0 ? (
                      selectedVehicle.maintenanceHist.map((m, idx) => (
                        <li key={idx}>{m.hist} - {new Date(m.date).toDateString()}</li>
                      ))
                    ) : (
                      <li>No records</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
