import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../Context/ContractsContext';
import { useDrivers } from '../Context/DriverContext';
import { getVehicles } from '../APIS/APIS';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';

// UTIL: count periods between dates (inclusive-ish for UX)
const countPeriods = (startDate, endDate, frequency) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((end - start) / MS_PER_DAY) + 1; // inclusive days

  if (frequency === 'daily') return diffDays;

  if (frequency === 'weekly') {
    return Math.max(1, Math.ceil(diffDays / 7));
  }

  if (frequency === 'monthly') {
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    return Math.max(1, months);
  }

  return 0;
};

export default function ContractForm() {
  const navigate = useNavigate();
  const { addContract } = useContracts();
  const { drivers, fetchDrivers } = useDrivers();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    }
  };

  const [form, setForm] = useState({
    driverId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    status: 'active',
    paymentTerms: 'fixed',
    paymentAmount: 0,
    paymentFrequency: 'daily',
    expectedTotalPaymentAmount: 0,
    totalAmountPaid: 0,
    balanceLeft: 0,
  });

  // Load drivers and vehicles
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchDrivers(), fetchVehicles()]);
      } catch (e) {
        console.error('Error loading data:', e);
        setError('Failed to load data');
        toast.error('Failed to load drivers and vehicles');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchDrivers]);

  // Auto-compute expected & balance for FIXED terms when possible
  const autoExpected = useMemo(() => {
    if (form.paymentTerms !== 'fixed') return 0;
    const periods = countPeriods(form.startDate, form.endDate, form.paymentFrequency);
    const expected = Math.max(0, Number(form.paymentAmount || 0) * periods);
    return expected || 0;
  }, [form.paymentTerms, form.startDate, form.endDate, form.paymentFrequency, form.paymentAmount]);

  const autoBalance = useMemo(() => {
    const expected = (form.paymentTerms === 'fixed')
      ? autoExpected
      : (form.expectedTotalPaymentAmount || 0);
    const paid = Number(form.totalAmountPaid || 0);
    return Math.max(0, expected - paid);
  }, [form.paymentTerms, form.expectedTotalPaymentAmount, form.totalAmountPaid, autoExpected]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Coerce numbers for numeric fields
    if (['paymentAmount', 'expectedTotalPaymentAmount', 'totalAmountPaid'].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Build payload according to schema + computed fields
    const payload = {
      driverId: form.driverId,
      vehicleId: form.vehicleId,
      startDate: form.startDate ? new Date(form.startDate) : null,
      endDate: form.endDate ? new Date(form.endDate) : null,
      status: form.status,
      paymentTerms: form.paymentTerms,
      paymentAmount: Number(form.paymentAmount || 0),
      paymentFrequency: form.paymentFrequency,
      expectedTotalPaymentAmount: form.paymentTerms === 'fixed'
        ? autoExpected
        : Number(form.expectedTotalPaymentAmount || 0),
      totalAmountPaid: Number(form.totalAmountPaid || 0),
      balanceLeft: autoBalance,
    };

    try {
      await addContract(payload);
      toast.success('Contract created successfully!');
      setTimeout(() => {
        navigate('/contracts/list');
      }, 1500);
    } catch (err) {
      console.error('Error saving contract:', err);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to save contract';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen}/>
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Create New Contract</h1>
            <button 
              onClick={() => navigate('/contracts/list')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Contracts
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Contract Details</h2>
                <p className="text-blue-100 text-sm mt-1">Fill in the details to create a new contract</p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Driver Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver *</label>
                    <select
                      name="driverId"
                      value={form.driverId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select a driver</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.firstName} {d.lastName} — {d.licenseNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle *</label>
                    <select
                      name="vehicleId"
                      value={form.vehicleId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.make} {v.model} — {v.plateNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Divider */}
                  <div className="md:col-span-2 border-t border-gray-200 my-2"></div>

                  {/* Dates Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <select
                      name="paymentTerms"
                      value={form.paymentTerms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {form.paymentTerms === 'fixed' ? 'Payment Amount (per period) *' : 'Payment % (0-100) *'}
                    </label>
                    <input
                      type="number"
                      name="paymentAmount"
                      value={form.paymentAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency *</label>
                    <select
                      name="paymentFrequency"
                      value={form.paymentFrequency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Expected Total */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Total Payment Amount</label>
                    <input
                      type="number"
                      name="expectedTotalPaymentAmount"
                      value={
                        form.paymentTerms === 'fixed'
                          ? autoExpected
                          : form.expectedTotalPaymentAmount
                      }
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      step="0.01"
                      disabled={form.paymentTerms === 'fixed'}
                      placeholder={form.paymentTerms === 'fixed' ? 'Auto-calculated' : 'Enter expected total'}
                    />
                    {form.paymentTerms === 'fixed' && (
                      <p className="text-xs text-gray-500 mt-2">
                        Auto-calculated: {form.paymentAmount} × {countPeriods(form.startDate, form.endDate, form.paymentFrequency)} periods
                      </p>
                    )}
                  </div>

                  {/* Total Paid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount Paid</label>
                    <input
                      type="number"
                      name="totalAmountPaid"
                      value={form.totalAmountPaid}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Balance */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Balance Left</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="text-lg font-semibold text-gray-800">
                        GHC{autoBalance.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Auto-calculated balance</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex gap-3 justify-end pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate('/contracts/list')}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-200 flex items-center"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 极狐0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                          </svg>
                          Create Contract
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
}