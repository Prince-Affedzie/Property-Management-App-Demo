import React, { useState, useEffect } from "react";
import { useContractPayments } from "../Context/ContractPaymentContext";
import { useContracts } from "../Context/ContractsContext";
import { useDrivers } from "../Context/DriverContext";
import { useNavigate, useParams } from "react-router-dom";
import VehicleSidebar from "../Components/Layout/VehicleSidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleTopNav from "../Components/Layout/VehicleTopNavBar";
import {
  
  getSingleContractPayment,
  
} from "../APIS/APIS";

const EditContractPayment = () => {
  const { editPayment } = useContractPayments();
  const { contracts, fetchContracts } = useContracts();
  const { drivers, fetchDrivers } = useDrivers();
  const navigate = useNavigate();
  const { id } = useParams();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [form, setForm] = useState({
    contractId: "",
    driverId: "",
    amount: "",
    paymentDate: "",
    paymentMethod: "cash",
    reference: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchPaymentById = async(Id)=>{
    try{
        const res = await getSingleContractPayment(Id)
        if(res.status ===200){
            return res.data
        }

    }catch(err){
        console.log(err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
     
      try {
        await Promise.all([fetchContracts(), fetchDrivers()]);
        
        // Load the payment data to edit
        if (id) {
          const payment = await fetchPaymentById(id);
          
          // Format date for input field (YYYY-MM-DD)
          const paymentDate = payment.paymentDate 
            ? new Date(payment.paymentDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          setForm({
            contractId: payment.contractId?._id || payment.contractId || "",
            driverId: payment.driverId?._id || payment.driverId || "",
            amount: payment.amount || "",
            paymentDate: paymentDate,
            paymentMethod: payment.paymentMethod || "cash",
            reference: payment.reference || "",
            notes: payment.notes || "",
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-select driver when contract is selected
    if (name === 'contractId' && value) {
      const selectedContract = contracts.find(c => c._id === value);
      if (selectedContract && selectedContract.driverId) {
        setForm(prev => ({ ...prev, driverId: selectedContract.driverId._id || selectedContract.driverId }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.contractId) newErrors.contractId = 'Contract is required';
    if (!form.driverId) newErrors.driverId = 'Driver is required';
    if (!form.amount || form.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!form.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!form.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      await editPayment(id, {
        ...form,
        amount: Number(form.amount)
      });
      
      toast.success('Payment updated successfully!');
      setTimeout(() => {
        navigate("/contract_payment/list");
      }, 1500);
    } catch (error) {
      console.error('Error updating payment:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to update payment';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
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
              <h1 className="text-2xl font-bold text-gray-800">Edit Contract Payment</h1>
              <p className="text-gray-600 text-sm mt-1">Update payment information</p>
            </div>
            <button
              onClick={() => navigate("/payments")}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Payments
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Update Payment Details</h2>
                <p className="text-blue-100 text-sm mt-1">Modify the payment information</p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contract Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract *
                    </label>
                    <select
                      name="contractId"
                      value={form.contractId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.contractId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select a contract</option>
                      {contracts.map((contract) => (
                        <option key={contract._id} value={contract._id}>
                          {contract.title || `Contract #${contract._id.slice(-6)}`} - 
                          {contract.driverId?.firstName ? ` ${contract.driverId.firstName} ${contract.driverId.lastName}` : ' Unknown Driver'} - 
                          {contract.vehicleId?.plateNumber ? ` ${contract.vehicleId.plateNumber}` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.contractId && (
                      <p className="mt-1 text-sm text-red-600">{errors.contractId}</p>
                    )}
                  </div>

                  {/* Driver Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver *
                    </label>
                    <select
                      name="driverId"
                      value={form.driverId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.driverId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select a driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                        </option>
                      ))}
                    </select>
                    {errors.driverId && (
                      <p className="mt-1 text-sm text-red-600">{errors.driverId}</p>
                    )}
                  </div>

                  {/* Amount and Payment Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (GHS) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={form.paymentDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.paymentDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['cash', 'bank_transfer', 'mobile_money'].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            form.paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={form.paymentMethod === method}
                            onChange={handleChange}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                            {method.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.paymentMethod && (
                      <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                    )}
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={form.reference}
                      onChange={handleChange}
                      placeholder="Enter reference number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Additional notes about this payment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate("/payments")}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-200 flex items-center"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Update Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContractPayment;