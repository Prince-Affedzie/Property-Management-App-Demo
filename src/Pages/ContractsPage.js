import React, { useState,useEffect } from "react";
import { useNavigate, Link, Links } from "react-router-dom";
import { useContracts } from "../Context/ContractsContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleSidebar from "../Components/Layout/VehicleSidebar";
import VehicleTopNav from "../Components/Layout/VehicleTopNavBar";

const ContractsPage = () => {
  const { contracts, loading, error, removeContract } = useContracts();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table"); // table or cards
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <VehicleSidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <VehicleSidebar />
      <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500 text-lg px-4 text-center">Error loading contracts: {error.message}</div>
      </div>
    </div>
  );

  // Filter contracts based on search term and status
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      (contract.driverId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       contract.driverId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       contract.vehicleId?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       contract.paymentTerms?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort contracts
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    if (sortBy === "startDate" || sortBy === "endDate") {
      return sortOrder === "asc" 
        ? new Date(a[sortBy]) - new Date(b[sortBy])
        : new Date(b[sortBy]) - new Date(a[sortBy]);
    }
    
    if (sortBy === "driver") {
      const nameA = `${a.driverId?.firstName} ${a.driverId?.lastName}`;
      const nameB = `${b.driverId?.firstName} ${b.driverId?.lastName}`;
      return sortOrder === "asc" 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    
    if (sortBy === "paymentAmount") {
      return sortOrder === "asc" 
        ? a.paymentAmount - b.paymentAmount
        : b.paymentAmount - a.paymentAmount;
    }
    
    return 0;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (contractId) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      try {
        await removeContract(contractId);
        toast.success("Contract deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete contract");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      terminated: "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const getPaymentFrequencyLabel = (frequency) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly"
    };
    
    return labels[frequency] || frequency;
  };

  // Calculate stats
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const terminatedContracts = contracts.filter(c => c.status === 'terminated').length;
  const totalRevenue = contracts.reduce((sum, contract) => sum + (contract.totalAmountPaid || 0), 0);
  const pendingRevenue = contracts.reduce((sum, contract) => sum + (contract.balanceLeft || 0), 0);

  // Contract Card Component for mobile view
  const ContractCard = ({ contract }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <Link to={`/contract_details/${contract._id}`} className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <span className="font-medium text-blue-800 text-sm">
                {contract.driverId?.firstName?.charAt(0)}{contract.driverId?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900 text-sm">
              {contract.driverId?.firstName} {contract.driverId?.lastName}
            </div>
            <div className="text-xs text-gray-500">{contract.driverId?.licenseNumber}</div>
          </div>
        </Link>
        {getStatusBadge(contract.status)}
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Vehicle:</span>
          <span className="text-gray-900 font-medium">
            {contract.vehicleId?.make} {contract.vehicleId?.model}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Plate:</span>
          <span className="text-gray-900">{contract.vehicleId?.plateNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Start Date:</span>
          <span className="text-gray-900">{formatDate(contract.startDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">End Date:</span>
          <span className={`${!contract.endDate ? 'text-gray-400' : 'text-gray-900'}`}>
            {contract.endDate ? formatDate(contract.endDate) : 'Ongoing'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount:</span>
          <span className="text-gray-900 font-medium">{formatCurrency(contract.paymentAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Frequency:</span>
          <span className="text-gray-900">{getPaymentFrequencyLabel(contract.paymentFrequency)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-2">Payment Terms:</div>
        <div className="text-sm text-gray-900 mb-3">{contract.paymentTerms}</div>
        
        <div className="flex space-x-2">
          <Link to={`/edit_contract/${contract._id}`}
            className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
            title="Edit contract"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
            onClick={() => handleDelete(contract._id)}
            title="Delete contract"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
       <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Contract Management</h1>
            <Link to='/contract/form' className="flex items-center justify-center px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Contract
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{contracts.length}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Total Contracts</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{activeContracts}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Active</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{completedContracts}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{terminatedContracts}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Terminated</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-base sm:text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-4 sm:p-6 mb-6 sm:mb-8 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col space-y-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${statusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All Contracts
                </button>
                <button
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${statusFilter === 'active' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${statusFilter === 'completed' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </button>
                <button
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${statusFilter === 'terminated' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setStatusFilter('terminated')}
                >
                  Terminated
                </button>
              </div>

              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="relative flex-1 sm:max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-8 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* View Mode Toggle - Only show on small screens 
                <div className="flex bg-gray-100 rounded-lg p-1 sm:hidden">
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </button>
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </button>
                </div>
                */}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className={`mt-6  sm:hidden`}>
              {sortedContracts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-gray-600">No contracts found</p>
                </div>
              ) : (
                sortedContracts.map((contract) => (
                  <ContractCard key={contract._id} contract={contract} />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div style={{
             display: windowWidth >= 768 ? 'block' : 'none',
            }}>
              <div className="mt-6 overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                          onClick={() => handleSort("driver")}
                        >
                          <div className="flex items-center">
                            Driver
                            {sortBy === "driver" && (
                              <svg className={`w-4 h-4 ml-1 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="hidden lg:table-cell px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Vehicle
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                          onClick={() => handleSort("startDate")}
                        >
                          <div className="flex items-center">
                            <span className="hidden sm:inline">Start Date</span>
                            <span className="sm:hidden">Start</span>
                            {sortBy === "startDate" && (
                              <svg className={`w-4 h-4 ml-1 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="hidden md:table-cell px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          End Date
                        </th>
                        <th scope="col" className="hidden xl:table-cell px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Payment Terms
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                          onClick={() => handleSort("paymentAmount")}
                        >
                          <div className="flex items-center">
                            Amount
                            {sortBy === "paymentAmount" && (
                              <svg className={`w-4 h-4 ml-1 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="hidden lg:table-cell px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Frequency
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedContracts.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-8 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-4 text-gray-600">No contracts found</p>
                          </td>
                        </tr>
                      ) : (
                        sortedContracts.map((contract) => (
                          <tr key={contract._id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4">
                              <Link to={`/contract_details/${contract._id}`} className="flex items-center">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
                                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full">
                                    <span className="font-medium text-blue-800 text-xs sm:text-sm">
                                      {contract.driverId?.firstName?.charAt(0)}{contract.driverId?.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-2 sm:ml-4">
                                  <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                    {contract.driverId?.firstName} {contract.driverId?.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 lg:hidden">
                                    {contract.vehicleId?.plateNumber}
                                  </div>
                                  <div className="text-xs text-gray-500 hidden sm:block lg:hidden">
                                    {contract.driverId?.licenseNumber}
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{contract.vehicleId?.make} {contract.vehicleId?.model}</div>
                              <div className="text-xs text-gray-500">{contract.vehicleId?.plateNumber}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm text-gray-900">{formatDate(contract.startDate)}</div>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${!contract.endDate ? 'text-gray-400' : 'text-gray-900'}`}>
                                {contract.endDate ? formatDate(contract.endDate) : 'Ongoing'}
                              </div>
                            </td>
                            <td className="hidden xl:table-cell px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{contract.paymentTerms}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm text-gray-900 font-medium">{formatCurrency(contract.paymentAmount)}</div>
                              <div className="text-xs text-gray-500 lg:hidden">
                                {getPaymentFrequencyLabel(contract.paymentFrequency)}
                              </div>
                            </td>
                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{getPaymentFrequencyLabel(contract.paymentFrequency)}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(contract.status)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <div className="flex space-x-1 sm:space-x-2">
                                <Link to={`/edit_contract/${contract._id}`}
                                  className="p-1 sm:p-2 text-blue-600 transition-colors duration-200 rounded-full hover:bg-blue-100"
                                  title="Edit contract"
                                >
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button
                                  className="p-1 sm:p-2 text-red-600 transition-colors duration-200 rounded-full hover:bg-red-100"
                                  onClick={() => handleDelete(contract._id)}
                                  title="Delete contract"
                                >
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsPage;