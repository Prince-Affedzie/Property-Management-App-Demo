import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { getApartmentProperties, deleteApartment } from '../APIS/APIS';
import { toast } from 'react-toastify';
import exportToExcel from '../Utils/exportToExcel';
import {Banknote} from 'lucide-react'
import { FiHome, FiDollarSign, FiMapPin, FiUsers, FiPlus, FiFilter, FiSearch, FiDownload, FiEdit2, FiTrash2, FiInfo } from 'react-icons/fi';
import StatusBadge from '../Components/units/StatusBadge';

export default function ApartmentsListPage() {
  const fields = [
    { key: 'title', label: 'Title' },
    { key: 'price', label: 'Renting Price' },
    { key: 'location', label: 'Location' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'tenantCount', label: 'Tenant Count' }
  ];

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true);
        const response = await getApartmentProperties();
        if (response.status === 200) {
          console.log(response.data)
          // Add tenantCount to each apartment
          const apartmentsWithCount = response.data.map(apt => ({
            ...apt,
            tenantCount: apt.tenants ? apt.tenants.length : 0
          }));
          setApartments(apartmentsWithCount);
        } else {
          setApartments([]);
        }
      } catch (err) {
        console.log(err);
        setApartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApartments();
  }, []);

  useEffect(()=>{
    console.log(apartments)
  })

  const deleteApart = async (Id) => {
    const confirmed = window.confirm("Are you sure you want to delete this apartment?");
    if (!confirmed) return;
    try {
      const response = await deleteApartment(Id);
      if (response.status === 200) {
        toast.success('Apartment Deleted Successfully');
        setApartments(prev => prev.filter(apt => apt._id !== Id));
      } else {
        toast.error(response.error || 'An Error Occurred. Please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unexpected error.';
      toast.error(message);
    }
  };

  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch = apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-gray-50 ">
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Apartments Management</h1>
              <p className="text-gray-600">View and manage all apartment properties</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search apartments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiFilter />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              
              <button
                onClick={() => navigate('/apartments/add_property')}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus /> Add Property
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold">{apartments.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold">
                {apartments.filter(a => a.status === 'Available').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Occupied</p>
              <p className="text-2xl font-bold">
                {apartments.filter(a => a.status === 'Occupied').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Under Maintenance</p>
              <p className="text-2xl font-bold">
                {apartments.filter(a => a.status === 'Maintenance').length}
              </p>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => exportToExcel(apartments, 'Apartments_List', fields)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload /> Export to Excel
            </button>
          </div>

          {/* Apartments Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <FiInfo className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No apartments found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {currentItems.map((apt) => (
                 // Update the apartment card rendering part with these responsive improvements:
<div key={apt._id} className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow h-full flex flex-col">
  <div className="flex items-start justify-between mb-2 sm:mb-3">
    <div className="min-w-0 pr-2">
      <h2 
        className="text-base sm:text-lg font-semibold text-gray-800 truncate"
        title={apt.title} // Show full title on hover
      >
        {apt.title}
      </h2>
      <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
        <FiMapPin className="mr-1 flex-shrink-0" size={12} />
        <span className="truncate">{apt.location}</span>
      </div>
    </div>
    <div className="flex-shrink-0">
      <StatusBadge status={apt.status} />
    </div>
  </div>
  
  <div className="flex items-center justify-between mb-3 sm:mb-4">
    <div className="flex items-center text-sm sm:text-base text-blue-600 font-medium">
      <Banknote className="mr-1" size={14} />
      <span>GHC {apt.price}/mo</span>
    </div>
    
    <div className="flex items-center text-xs sm:text-sm text-purple-600">
      <FiUsers className="mr-1" size={14} />
      <span>{apt.tenantCount} {apt.tenantCount === 1 ? 'Tenant' : 'Tenants'}</span>
    </div>
  </div>
  
  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
    {apt.description}
  </p>
  
  <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
    <div className="flex justify-between items-center">
      <button
        onClick={() => setSelectedApartment(apt)}
        className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 font-medium"
      >
        View Details
      </button>
      
      <div className="flex gap-2 sm:gap-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/apartment/edit/${apt._id}`);
          }}
          className="text-yellow-500 hover:text-yellow-600"
          aria-label="Edit"
        >
          <FiEdit2 size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            deleteApart(apt._id);
          }}
          className="text-red-500 hover:text-red-600"
          aria-label="Delete"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  </div>
</div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg border ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}

          {/* Apartment Details Modal */}
          {selectedApartment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{selectedApartment.title}</h2>
                    <button
                      onClick={() => setSelectedApartment(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedApartment.location}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">GHC {selectedApartment.price}/month</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <StatusBadge status={selectedApartment.status} />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Tenants</p>
                      <p className="font-medium">
                        {selectedApartment.tenantCount} {selectedApartment.tenantCount === 1 ? 'Tenant' : 'Tenants'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700 mt-1">{selectedApartment.description || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedApartment(null);
                        navigate(`/apartment/edit/${selectedApartment._id}`);
                      }}
                      className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
                    >
                      Edit Apartment
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApartment(null);
                        navigate(`/apartments/${selectedApartment._id}/tenants`);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Tenants
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}