import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContracts } from '../Context/ContractsContext';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';

// Utility function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Utility function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

// Status badge component
const StatusBadge = ({ status }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    terminated: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Payment terms display component
const PaymentTermsDisplay = ({ contract }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-600">Payment Terms:</span>
          <p className="font-medium">{contract.paymentTerms === 'fixed' ? 'Fixed Amount' : 'Percentage'}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">Frequency:</span>
          <p className="font-medium capitalize">{contract.paymentFrequency}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">Amount per period:</span>
          <p className="font-medium">
            {contract.paymentTerms === 'fixed' 
              ? formatCurrency(contract.paymentAmount)
              : `${contract.paymentAmount}%`
            }
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-600">Total Periods:</span>
          <p className="font-medium">{contract.periodCount || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchContractById,removeContract } = useContracts();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      try {
        const contractData = await fetchContractById(id);
        setContract(contractData);
      } catch (err) {
        console.error('Error loading contract:', err);
        setError('Failed to load contract details');
        toast.error('Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [id, fetchContractById]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await removeContract(id);
      toast.success('Contract deleted successfully!');
      setTimeout(() => {
        navigate('/contracts/list');
      }, 1000);
    } catch (err) {
      console.error('Error deleting contract:', err);
      toast.error('Failed to delete contract');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex h-screen bg-gray-50">
         <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center">
         
          <div className="text-center">
            <div className="text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
              <h3 className="text-lg font-semibold mb-2">Error Loading Contract</h3>
              <p className="mb-4">{error || 'Contract not found'}</p>
              <button
                onClick={() => navigate('/contracts/list')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Contracts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
      <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Contract Details</h1>
              <p className="text-gray-600 text-sm mt-1">Contract ID: {contract._id}</p>
            </div>
            <div className=" hidden md:flex items-center space-x-3">
              <Link
                to="/contracts/list"
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Contracts
              </Link>
              <Link
                to={`/edit_contract/${contract._id}`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Contract
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Contract Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">Contract Information</h2>
                  <p className="text-blue-100 text-sm mt-1">Complete contract details</p>
                </div>
                <StatusBadge status={contract.status} />
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-6">
                {/* Driver and Vehicle Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Driver Information
                    </h3>
                    {contract.driverId ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Name:</span>{' '}
                          <span className="font-medium">
                            {contract.driverId.firstName} {contract.driverId.lastName}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">License:</span>{' '}
                          <span className="font-medium">{contract.driverId.licenseNumber}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Contact:</span>{' '}
                          <span className="font-medium">{contract.driverId.phoneNumber}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No driver assigned</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Vehicle Information
                    </h3>
                    {contract.vehicleId ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Vehicle:</span>{' '}
                          <span className="font-medium">
                            {contract.vehicleId.make} {contract.vehicleId.model} ({contract.vehicleId.year})
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Plate Number:</span>{' '}
                          <span className="font-medium">{contract.vehicleId.plateNumber}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Color:</span>{' '}
                          <span className="font-medium">{contract.vehicleId.color}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">VIN:</span>{' '}
                          <span className="font-medium">{contract.vehicleId.vin}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No vehicle assigned</p>
                    )}
                  </div>
                </div>

                {/* Contract Dates */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Contract Period
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Start Date:</span>
                      <p className="font-medium">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">End Date:</span>
                      <p className="font-medium">{formatDate(contract.endDate) || 'Ongoing'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Duration:</span>
                      <p className="font-medium">
                        {contract.startDate && contract.endDate 
                          ? `${Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} days`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created At:</span>
                      <p className="font-medium">{formatDate(contract.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Financial Information
                  </h3>
                  
                  <PaymentTermsDisplay contract={contract} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-600">Expected Total</span>
                      <p className="text-xl font-bold text-blue-800">{formatCurrency(contract.expectedTotalPaymentAmount)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-600">Amount Paid</span>
                      <p className="text-xl font-bold text-green-800">{formatCurrency(contract.totalAmountPaid)}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <span className="text-sm text-orange-600">Balance Left</span>
                      <p className="text-xl font-bold text-orange-800">{formatCurrency(contract.balanceLeft)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-3 sm:gap-0">
  <button
    onClick={handleDelete}
    disabled={deleting}
    className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center"
  >
    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 极速赛车开奖结果 极速赛车开奖直播 极速赛车开奖记录" />
    </svg>
    {deleting ? 'Deleting...' : 'Delete'}
  </button>
  
  <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
    <Link
      to={`/edit_contract/${contract._id}`}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto justify-center"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2极速赛车开奖结果 极速赛车开奖直播 极速赛车开奖记录a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit
    </Link>
  </div>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}