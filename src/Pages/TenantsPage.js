import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { Pencil, Trash2 } from 'lucide-react';
import { fetchTenantsRecords, deleteTenantRecord } from '../APIS/APIS';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import exportToExcel from '../Utils/exportToExcel';


const fields = [
  { key: 'tenantName', label: 'Tenant Name' },
  { key: 'tenantPhone', label: 'Phone' },
  { key: 'roomDescription', label: 'Room Description' },
  { key: 'rentedDate', label: 'Rented Date' },
  { key: 'expirationDate', label: 'Rent Expiry Date' },
  { key: 'noOfMonthsRented', label: 'No of Months Rented' },
  { key: 'amountPaidOnUtility', label: 'Utility' },
  { key: 'monthlyPrice', label: 'Monthly Price' },
  { key: 'status', label: 'Tenant Status' },
  { key: 'totalAmount', label: 'Total Amount' },

  
];

function TenantOverview({ tenants }) {
  const totalTenants = tenants.length;
  const totalUtility = tenants.reduce((acc, t) => acc + (t.amountPaidOnUtility || 0), 0);
  const totalRent = tenants.reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-500">Total Tenants</p>
        <p className="text-2xl font-bold">{totalTenants}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-500">Total Utility</p>
        <p className="text-2xl font-bold text-blue-600">GHC {totalUtility.toFixed(2)}</p>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-500">Total Rent</p>
        <p className="text-2xl font-bold text-green-600">GHC {totalRent.toFixed(2)}</p>
      </div>
    </div>
  );
}

function TenantTable({ tenants, onDelete, currentPage, totalPages, onPageChange }) {
  const navigate = useNavigate();

  if (!tenants.length) {
    return (
      <div className="text-center text-gray-500 py-10">No tenant records found.</div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Phone</th>
              <th className="px-3 py-2 font-semibold">Apartment</th>
              <th className="px-3 py-2 font-semibold">Start</th>
              <th className="px-3 py-2 font-semibold">End</th>
              <th className="px-3 py-2 font-semibold">Mths</th>
              <th className="px-3 py-2 font-semibold">Rent</th>
              <th className="px-3 py-2 font-semibold">Util</th>
              <th className="px-3 py-2 font-semibold">Total</th>
              <th className="px-3 py-2 text-center font-semibold">⋮</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant._id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-4 max-w-[160px] truncate">{tenant.tenantName}</td>
                <td className="px-3 py-4 whitespace-nowrap">{tenant.tenantPhone}</td>
                <td className="px-3 py-4 whitespace-nowrap max-w-[160px] truncate">{tenant.apartment?.title || 'N/A'}</td>
                <td className="px-3 py-4 whitespace-nowrap">{new Date(tenant.rentedDate).toLocaleDateString()}</td>
                <td className="px-3 py-4 whitespace-nowrap">{new Date(tenant.expirationDate).toLocaleDateString()}</td>
                <td className="px-3 py-4 text-center">{tenant.noOfMonthsRented}</td>
                <td className="px-3 py-4">₵{(tenant.monthlyPrice || 0).toFixed(2)}</td>
                <td className="px-3 py-4">₵{(tenant.amountPaidOnUtility || 0).toFixed(2)}</td>
                <td className="px-3 py-4 font-semibold text-green-700">₵{(tenant.totalAmount || 0).toFixed(2)}</td>
                <td className="px-3 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => navigate(`/apartments/tenant/edit/${tenant._id}`)} className="text-blue-500 hover:text-blue-700" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(tenant)} className="text-red-500 hover:text-red-700" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 p-4 border-t">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-1 text-sm rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function TenantManagementPage() {
  const navigate = useNavigate();
  const [tenantList, setTenantList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const response = await fetchTenantsRecords();
        setTenantList(response.status === 200 ? response.data : []);
      } catch (err) {
        console.error(err);
        setTenantList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleDelete = async (tenantToDelete) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${tenantToDelete.tenantName}?`);
    if (!confirmed) return;

    try {
      const response = await deleteTenantRecord(tenantToDelete._id);
      if (response.status === 200) {
        toast.success('Tenant record deleted successfully');
        setTenantList(prev => prev.filter(t => t._id !== tenantToDelete._id));
      } else {
        toast.error(response.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Unexpected error. Please try again.';
      console.error(errorMessage);
      toast.error(errorMessage);
    }
  };

  const totalPages = Math.ceil(tenantList.length / itemsPerPage);
  const paginatedTenants = tenantList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

        <main className="flex-1 w-full px-4 sm:px-6 py-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">Tenant Management</h1>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center' >
            <button
              onClick={() => navigate('/apartments/add_tenant_record')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add New Tenant
            </button>
             <button
                    onClick={() => exportToExcel(tenantList, 'Tenants_List',fields )}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition lg:ml-3"
                      >
                      Export Tenants
              </button>
              </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full">
              <TenantOverview tenants={tenantList} />
              <TenantTable tenants={paginatedTenants} onDelete={handleDelete} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
