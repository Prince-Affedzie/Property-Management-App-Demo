import React, { useState,useEffect } from "react";
import { useContractPayments } from "../Context/ContractPaymentContext";
import { Link } from "react-router-dom";
import VehicleSidebar from "../Components/Layout/VehicleSidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleTopNav from "../Components/Layout/VehicleTopNavBar";
const ContractPaymentsList = () => {
  const { payments, loading, removePayment } = useContractPayments();
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
      useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await removePayment(id);
      toast.success('Payment deleted successfully!');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.contractId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentMethodBadge = (method) => {
    const methodStyles = {
      cash: "bg-green-100 text-green-800",
      bank_transfer: "bg-blue-100 text-blue-800",
      mobile_money: "bg-purple-100 text-purple-800"
    };

    const methodLabels = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      mobile_money: "Mobile Money"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodStyles[method] || 'bg-gray-100 text-gray-800'}`}>
        {methodLabels[method] || method}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <VehicleSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
    <h1 className="text-2xl font-bold text-gray-800">Contract Payments</h1>
    <p className="text-gray-600 text-sm mt-1">Manage and track all contract payments</p>
  </div>
  <Link
    to="/add_contract_payment"
    className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
  >
    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
    <span className="hidden sm:inline">Add Payment</span>
    <span className="sm:hidden">Add</span>
  </Link>
</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search payments by driver, contract, reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            </div>


             {/* Summary Stats */}
            {filteredPayments.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.amount, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Table */}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
  {/* Desktop Table View */}
  <div style={{
             display: windowWidth >= 768 ? 'block' : 'none',
            }}>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contract
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredPayments.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                {searchTerm ? 'No payments found matching your search' : 'No payments recorded yet'}
              </td>
            </tr>
          ) : (
            filteredPayments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {`Contract # ${payment.contractId?._id.slice(-6)}`|| 'N/A'} 
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.driverId? ` ${payment.driverId.firstName} ${payment.driverId.lastName}` : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">
                    {formatCurrency(payment.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(payment.paymentDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentMethodBadge(payment.paymentMethod)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.reference || "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {payment.notes || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit_contract_payment/${payment._id}`}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit payment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(payment._id)}
                      disabled={deletingId === payment._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                      title="Delete payment"
                    >
                      {deletingId === payment._id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
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

  {/* Mobile Card View */}
  <div className="lg:hidden">
    {filteredPayments.length === 0 ? (
      <div className="p-6 text-center text-gray-500">
        {searchTerm ? 'No payments found matching your search' : 'No payments recorded yet'}
      </div>
    ) : (
      <div className="divide-y divide-gray-200">
        {filteredPayments.map((payment) => (
          <div key={payment._id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    Contract # {payment.contractId?._id.slice(-6) || 'N/A'}
                  </h3>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  {payment.driverId ? `${payment.driverId.firstName} ${payment.driverId.lastName}` : "N/A"}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(payment.paymentDate)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Method:</span>
                {getPaymentMethodBadge(payment.paymentMethod)}
              </div>
              
              {payment.reference && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Reference:</span>
                  <span className="text-sm text-gray-900">{payment.reference}</span>
                </div>
              )}
              
              {payment.notes && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Notes:</span>
                  <p className="text-sm text-gray-900">{payment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Link
                to={`/edit_contract_payment/${payment._id}`}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-900 transition-colors"
                title="Edit payment"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => handleDelete(payment._id)}
                disabled={deletingId === payment._id}
                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                title="Delete payment"
              >
                {deletingId === payment._id ? (
                  <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPaymentsList;