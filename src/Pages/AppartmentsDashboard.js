import { useState, useEffect } from 'react';
import {useNavigate} from'react-router-dom'
import { 
  Home, Users, Banknote, AlertTriangle, Wrench, 
  Calendar, Phone, Search, Plus, TrendingUp, 
  Building2, User, Clock, Eye, EyeOff, Activity,
  MapPin, DollarSign, FileText, CreditCard, RefreshCw
} from 'lucide-react';
import { getApartmentProperties } from '../APIS/APIS';
import Sidebar from '../Components/Layout/Sidebar';
import TopNav from '../Components/Layout/TopNav';
import ExpiringLeasesModal from '../Components/Dashboard/ExpiringLeaseModal'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ApartmentDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [apartments, setApartments] = useState([]);
  const [currency, setCurrency] = useState('GHC');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const [showExpiringLeasesModal, setShowExpiringLeasesModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getApartmentProperties();
        setApartments(response?.data || []);
      } catch (err) {
        console.error(err);
        setApartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate all dashboard metrics
  const metrics = {
    totalUnits: apartments.length,
    occupied: apartments.filter(a => a.status === 'Occupied').length,
    available: apartments.filter(a => a.status === 'Available').length,
    maintenance: apartments.filter(a => a.status === 'Maintenance').length,
    revenueGHC: apartments
      .filter(a => a.status === 'Occupied')
      .reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0),
    revenueUSD: 0, // Will be calculated
    tenants: apartments.flatMap(a => a.tenants || []).length,
    activeTenants: apartments.flatMap(a => (a.tenants || []).filter(t => t.status === 'Active')).length,
    expiringLeases: apartments.flatMap(a => 
      (a.tenants || [])
        .filter(t => t.status === 'Active' && t.expirationDate)
        .map(t => {
          const daysLeft = Math.floor((new Date(t.expirationDate) - Date.now()) / (1000 * 3600 * 24));
          return daysLeft <= 30 ? { ...t, apartmentTitle: a.title, daysLeft } : null;
        })
        .filter(Boolean)
    ),
    overduePayments: apartments.flatMap(a => 
      (a.tenants || []).filter(t => t.paymentStatus === 'Overdue')
    ).length,
    recentActivity: [] // Would come from API in real implementation
  };

  metrics.revenueUSD = metrics.revenueGHC / 12; // Example conversion rate

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Sidebar - Hidden on mobile when menu is closed */}
      <Sidebar toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Summary</h1>
              <p className="text-gray-600">Comprehensive overview of your property management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1 rounded-md border border-gray-200 text-sm">
                <span className="font-medium">GHC</span>: {metrics.revenueGHC.toLocaleString()}
                <span className="mx-2 text-gray-400">|</span>
                <span className="font-medium">USD</span>: {(metrics.revenueGHC/12).toLocaleString()}
              </div>
              <button 
                className="p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50"
                onClick={() => toast.info('Data refreshed')}
              >
                <RefreshCw size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Property Status Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Properties</h3>
                <Building2 size={18} className="text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Units</span>
                  <span className="font-medium">{metrics.totalUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-medium text-green-600">{metrics.occupied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-blue-600">{metrics.available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maintenance</span>
                  <span className="font-medium text-red-600">{metrics.maintenance}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Financials</h3>
                <Banknote size={18} className="text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Revenue (GHC)</span>
                  <span className="font-medium">{metrics.revenueGHC.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Revenue (USD)</span>
                  <span className="font-medium">{(metrics.revenueGHC/12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupancy Rate</span>
                  <span className="font-medium">
                    {metrics.totalUnits > 0 
                      ? `${Math.round((metrics.occupied / metrics.totalUnits) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overdue Payments</span>
                  <span className="font-medium text-red-600">{metrics.overduePayments}</span>
                </div>
              </div>
            </div>

            {/* Tenants Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Tenants</h3>
                <Users size={18} className="text-indigo-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tenants</span>
                  <span className="font-medium">{metrics.tenants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Tenants</span>
                  <span className="font-medium text-green-600">{metrics.activeTenants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiring Leases</span>
                  <span className="font-medium text-amber-600">{metrics.expiringLeases.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Applications</span>
                  <span className="font-medium text-blue-600">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Quick Actions</h3>
                <Activity size={18} className="text-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="p-2 bg-blue-50 text-blue-600 rounded-md text-sm flex items-center justify-center gap-1 hover:bg-blue-100"
                  onClick={() => navigate('/apartments/add_tenant_record')}
                >
                  <Plus size={14} /> Add Tenant
                </button>
                
                <button 
                  className="p-2 bg-amber-50 text-amber-600 rounded-md text-sm flex items-center justify-center gap-1 hover:bg-amber-100"
                  onClick={() => navigate('/apartment/add_payment')}
                >
                  <CreditCard size={14} /> Record Payment
                </button>
                <button 
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-md text-sm flex items-center justify-center gap-1 hover:bg-indigo-100"
                  onClick={() => navigate('/apartments/add_property')}
                >
                  <Building2 size={14} /> Add Property
                </button>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Expiring Leases */}
            {metrics.expiringLeases.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={18} />
                    Expiring Leases ({metrics.expiringLeases.length})
                  </h3>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                    Needs Attention
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {metrics.expiringLeases.slice(0, 4).map((lease, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-1 rounded-full">
                          <User size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lease.tenantName}</p>
                          <p className="text-xs text-gray-500">{lease.apartmentTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${lease.daysLeft <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                          {lease.daysLeft} day{lease.daysLeft !== 1 ? 's' : ''} left
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(lease.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {metrics.expiringLeases.length > 3 && (
                    <button
                     className="w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-2"
                     onClick={() => setShowExpiringLeasesModal(true)}
                     >
                      View all {metrics.expiringLeases.length} expiring leases →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Maintenance Alerts */}
            {metrics.maintenance > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2">
                    <Wrench className="text-red-500" size={18} />
                    Maintenance Required ({metrics.maintenance})
                  </h3>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                    Urgent
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {apartments.filter(a => a.status === 'Maintenance').slice(0, 3).map((apt, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-1 rounded-full">
                          <Home size={14} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{apt.title}</p>
                          <p className="text-xs text-gray-500">{apt.location}</p>
                        </div>
                      </div>
                      <button 
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                        onClick={() => toast.success('Marked as complete')}
                      >
                        Mark Complete
                      </button>
                    </div>
                  ))}
                  {metrics.maintenance > 3 && (
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-2">
                      View all {metrics.maintenance} maintenance issues →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tenant List Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-700 mb-2 md:mb-0">Tenants by Property</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {apartments.length > 0 ? (
                apartments.slice(0,4).map((apartment) => (
                  <div key={apartment._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <h4 className="font-medium text-gray-700 mb-2">{apartment.title}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(apartment.tenants || []).filter(t => 
                        t.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((tenant, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                          <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                            {tenant.tenantName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tenant.tenantName}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {tenant.status} • {tenant.tenantPhone}
                            </p>
                          </div>
                          {tenant.expirationDate && (
                            <div className="text-right">
                              <p className="text-xs font-medium">
                                {new Date(tenant.expirationDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {Math.floor((new Date(tenant.expirationDate) - Date.now()) / (1000 * 3600 * 24))} days left
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No properties found</h4>
                  <p className="text-xs text-gray-500">Add properties to start managing tenants</p>
                </div>
              )}
            </div>
          </div>
          <ExpiringLeasesModal
             leases={metrics.expiringLeases}
             isOpen={showExpiringLeasesModal}
             onClose={() => setShowExpiringLeasesModal(false)}
         />
        </main>
      </div>
    </div>
  );
}