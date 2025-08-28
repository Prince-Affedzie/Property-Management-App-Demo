import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getAllPayments } from '../APIS/APIS';
import { Pencil, Trash2 } from 'lucide-react';
import TopNav from '../Components/Layout/TopNav';
import exportToExcel from '../Utils/exportToExcel';

export default function PaymentsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 8;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const fields = [
    { key: 'tenant.tenantName', label: 'Tenant Name' },
    { key: 'amountPaid', label: 'Amount Paid' },
    { key: 'method', label: 'Payment Method' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' }
    
  ];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getAllPayments();
      if (response.status === 200) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) =>
    p?.tenant?.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const totalAmountPaid = filteredPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);


  const Pagination = () => (
    <div className="flex justify-center mt-6 gap-2 flex-wrap">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      

      <table className="min-w-full table-auto animate-pulse">
        <thead className="bg-gray-100">
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b">
              {[...Array(6)].map((__, j) => (
                <td key={j} className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} className="sticky top-0 z-30 bg-white shadow-md" />

        <main className="p-4 sm:p-6 flex-1 overflow-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Payment List</h1>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by tenant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => navigate('/apartment/add_payment')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + Add Payment
              </button>
              <button
                     onClick={() => exportToExcel(currentPayments, 'Payments_List',fields )}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition lg:ml-3"
                        >
                       Export Payments
                 </button>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : currentPayments.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No payments found.</div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg w-full">
              <div className="text-right text-blue-700 font-semibold mb-2 pr-2">
               Total Amount Paid: GHC {totalAmountPaid.toFixed(2)}
             </div>
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Tenant</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Amount</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Method</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">{payment.tenant?.tenantName}</td>
                      <td className="px-4 py-4 font-medium text-green-700">GHC {payment.amountPaid || 0}</td>
                      <td className="px-4 py-4 text-gray-600">{new Date(payment.date || 'N/A').toDateString()}</td>
                      <td className="px-4 py-4 text-gray-600">{payment.method || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            payment.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => navigate(`/apartment/edit_payment/${payment._id}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => console.log('Delete clicked:', payment)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && <Pagination />}
        </main>
      </div>
    </div>
  );
}
