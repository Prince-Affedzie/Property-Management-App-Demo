import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiPhone, FiCalendar, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { getTenantsByApartment } from '../APIS/APIS';
import { toast } from 'react-toastify';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import { fetchContext } from '../Context/initialFetchContext';

const ApartmentTenantsPage = () => {
  const { apartmentId } = useParams();
  const navigate = useNavigate();
  const { apartments } = useContext(fetchContext);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Get apartment details from context
  const apartment = apartments.find(apt => apt._id === apartmentId);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await getTenantsByApartment(apartmentId);
        if (response.status === 200) {
          setTenants(response.data);
        } else {
          toast.error('Failed to fetch tenants data');
          navigate('/apartments');
        }
      } catch (error) {
        toast.error('An error occurred while fetching tenants');
        navigate('/apartments');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [apartmentId]);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <div className="flex-1 flex flex-col">
          <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
          <main className="flex-1 p-4 md:p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <div className="flex-1 flex flex-col">
          <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
          <main className="flex-1 p-4 md:p-6">
            <div className="text-center text-gray-500">Apartment not found</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 self-start"
              >
                <FiArrowLeft className="mr-2" /> Back to Apartments
              </button>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
                  Tenants in {apartment.title}
                </h1>
                
                <Link
                  to={`/apartments/add_tenant_record`}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <FiPlus /> Add Tenant
                </Link>
              </div>
            </div>

            {/* Apartment Info Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{apartment.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{apartment.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Price</p>
                <p className="font-medium">GHC {apartment.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tenants</p>
                <p className="font-medium">{tenants.length}</p>
              </div>
            </div>

            {/* Tenants List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {tenants.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiUser className="mx-auto text-3xl text-gray-300 mb-3" />
                  <p>No tenants currently assigned to this apartment</p>
                  <Link
                    to={`/tenants/add?apartment=${apartmentId}`}
                    className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add your first tenant
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div  style={{
               display: windowWidth >= 1024 ? 'block' : 'none',
               }} className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenant
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rented Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expiration Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map(tenant => (
                          <tr key={tenant._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  <FiUser className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{tenant.tenantName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{tenant.tenantPhone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(tenant.rentedDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(tenant.expirationDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/apartments/tenant/edit/${tenant._id}`}
                                  className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                                  title="Edit tenant"
                                >
                                  <FiEdit2 className="h-5 w-5" />
                                </Link>
                                {/*<button
                                  onClick={() => {
                                    if (window.confirm(`Delete ${tenant.tenantName}?`)) {
                                      // Handle delete functionality
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete tenant"
                                >
                                  <FiTrash2 className="h-5 w-5" />
                                </button>*/}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4">
                    {tenants.map(tenant => (
                      <div key={tenant._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <FiUser className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{tenant.tenantName}</div>
                              <div className="text-sm text-gray-500">{tenant.tenantPhone}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/apartments/tenant/edit/${tenant._id}`}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </Link>
                            {/*<button
                              onClick={() => {
                                if (window.confirm(`Delete ${tenant.tenantName}?`)) {
                                  // Handle delete functionality
                                }
                              }}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>*/}
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Rented Date</div>
                            <div>{new Date(tenant.rentedDate).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Expires</div>
                            <div>{new Date(tenant.expirationDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApartmentTenantsPage;