import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Layout/Sidebar';
import { getPayment, editPayment } from '../APIS/APIS';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditPaymentPage() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    tenantName: '',
    amountPaid: '',
    date: '',
    method: '',
    status: 'Partial',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const response = await getPayment(Id);
        if (response.status === 200) {
          const fetchedData = response.data;
          console.log(fetchedData);
          setFormData({
            tenantId: fetchedData.tenant._id || '',
            tenantName: fetchedData.tenant.tenantName || '',
            amountPaid: fetchedData.amountPaid || '',
            date: fetchedData.date?.substring(0, 10) || '',
            method: fetchedData.method || '',
            status: fetchedData.status || 'Partial',
          });
        } else {
          setError('Failed to load payment data.');
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong while fetching payment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tenant: formData.tenantId,
      amountPaid: formData.amountPaid,
      date: formData.date,
      method: formData.method,
      status: formData.status,
    };

    try {
      const response = await editPayment(Id, payload);
      if (response.status === 200) {
        toast.success('Payment Record Modified Successfully');
        navigate('/apartment/payment/list');
      } else {
        toast.error(response.error || "An error occurred. Please try again");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "An unexpected error occurred. Please try again.";
      console.log(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer />
      <Sidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Edit Payment</h1>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600 font-medium">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                <input
                  name="tenantName"
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  value={formData.tenantName}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                <input
                  name="amountPaid"
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  name="date"
                  type="date"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <input
                  name="method"
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={formData.method}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Partial">Partial</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="sm:col-span-2 mt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Update Payment
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
