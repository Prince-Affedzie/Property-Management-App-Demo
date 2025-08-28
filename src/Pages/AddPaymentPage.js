import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchTenantsRecords, addPayment } from '../APIS/APIS';
import Select from 'react-select';
import ProcessingIndicator from '../Components/units/processingIndicator';

export default function AddPaymentPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tenantList, setTenantList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tenant: '',
    amountPaid: '',
    method: '',
    Date: '',
    status: 'Partial',
  });

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await fetchTenantsRecords();
        if (response.status === 200) {
          const options = response.data.map(t => ({ value: t._id, label: t.tenantName }));
          setTenantList(options);
        } else {
          setTenantList([]);
        }
      } catch (err) {
        console.error(err);
        setTenantList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, tenant: selectedOption.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const response = await addPayment(formData);
      if (response.status === 200) {
        toast.success('Payment Recorded Successfully');
        navigate('/apartment/payment/list');
      } else {
        toast.error(response.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "An unexpected error occurred. Please try again.";
      console.error(errorMessage);
      toast.error(errorMessage);
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer />
      <Sidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1">
        <TopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <main className="p-6 sm:p-6">
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Add New Payment</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                {loading ? (
                  <div className="text-blue-600">Loading tenants...</div>
                ) : (
                  <Select
                    options={tenantList}
                    onChange={handleSelectChange}
                    placeholder="Select a tenant"
                    className="text-sm"
                    isSearchable
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-sm"
                >
                  <option value="">Select a method</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="Date"
                  value={formData.Date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-sm"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-sm"
                >
                  <option value="Completed">Completed</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              <div className="sm:col-span-2 mt-4">
                <button
                disabled={loading}
                  type="submit"
                  className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300 text-sm 
                    ${loading ? 'opacity-70 scale-95 cursor-wait transition-all duration-300' : 'transition-all duration-300'}`}
                >
                   {loading ? <ProcessingIndicator message="Adding Payment..." /> : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
