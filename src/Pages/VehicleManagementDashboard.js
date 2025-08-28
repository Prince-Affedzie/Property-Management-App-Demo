import React, { useEffect, useState } from 'react';
import VehicleSidebar from '../Components/Layout/VehicleSidebar';
import TopNav from '../Components/Layout/TopNav';
import {
  Car,
  Truck,
  BusFront,
  Users,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { getVehicles } from '../APIS/APIS';
import { useContracts } from '../Context/ContractsContext';
import { useContractPayments } from '../Context/ContractPaymentContext';
import { Link } from 'react-router-dom';
import VehicleTopNav from '../Components/Layout/VehicleTopNavBar';

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { contracts, fetchContracts } = useContracts();
  const { payments, fetchPayments } = useContractPayments();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    activeContracts: 0,
    expiringContracts: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchContracts(),
          fetchPayments(),
          (async () => {
            const response = await getVehicles();
            if (response.status === 200) {
              setVehicles(response.data);
            }
          })()
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchContracts, fetchPayments]);

  useEffect(() => {
    if (contracts && payments) {
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const activeContracts = contracts.filter(contract => contract.status === 'active').length;
      
      // Contracts expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringContracts = contracts.filter(contract => {
        if (!contract.endDate) return false;
        const endDate = new Date(contract.endDate);
        return endDate <= thirtyDaysFromNow && endDate >= new Date() && contract.status === 'active';
      }).length;

      setStats({
        totalRevenue,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        activeContracts,
        expiringContracts
      });
    }
  }, [contracts, payments]);

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'commercial car': return <Car className="text-blue-600" size={20} />;
      case 'luxury car': return <Car className="text-purple-600" size={20} />;
      case 'taxi': return <Car className="text-yellow-500" size={20} />;
      case 'truck': return <Truck className="text-orange-600" size={20} />;
      case 'bus': return <BusFront className="text-red-500" size={20} />;
      default: return <Car className="text-gray-400" size={20} />;
    }
  };

  const countByType = (type) => vehicles.filter(v => v.vehiceType === type).length;

  const types = [
    { label: 'Commercial Cars', value: 'commercial car', icon: <Car className="text-blue-600" size={20} /> },
    { label: 'Luxury Cars', value: 'luxury car', icon: <Car className="text-purple-600" size={20} /> },
    { label: 'Taxis', value: 'taxi', icon: <Car className="text-yellow-500" size={20} /> },
    { label: 'Trucks', value: 'truck', icon: <Truck className="text-orange-600" size={20} /> },
    { label: 'Buses', value: 'bus', icon: <BusFront className="text-red-500" size={20} /> }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getContractsByStatus = (status) => {
    return contracts.filter(contract => contract.status === status);
  };

  const getRecentPayments = () => {
    return payments
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5);
  };

  const getExpiringContracts = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return contracts
      .filter(contract => {
        if (!contract.endDate || contract.status !== 'active') return false;
        const endDate = new Date(contract.endDate);
        return endDate <= thirtyDaysFromNow && endDate >= new Date();
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <div className="flex-1">
          <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
          <main className="p-6 mt-16">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm h-32"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm h-96"></div>
                <div className="bg-white p-6 rounded-xl shadow-sm h-96"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <VehicleSidebar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <VehicleTopNav toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your fleet today.</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={20} />
                </div>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-800 mb-2">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                12.5% from last month
              </p>
            </div>

            {/* Active Contracts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <CheckCircle className="text-blue-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Active Contracts</h3>
              <p className="text-2xl font-bold text-gray-800 mb-2">{stats.activeContracts}</p>
              <p className="text-sm text-gray-500">{contracts.length} total contracts</p>
            </div>

            {/* Expiring Contracts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="text-orange-600" size={20} />
                </div>
                <Clock className="text-orange-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Expiring Soon</h3>
              <p className="text-2xl font-bold text-gray-800 mb-2">{stats.expiringContracts}</p>
              <p className="text-sm text-orange-600">Next 30 days</p>
            </div>

            {/* Total Vehicles */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Car className="text-purple-600" size={20} />
                </div>
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Vehicles</h3>
              <p className="text-2xl font-bold text-gray-800 mb-2">{vehicles.length}</p>
              <p className="text-sm text-gray-500">Across all categories</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Payments */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
                <Link to="/contract_payment/list" className="text-blue-600 text-sm hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {getRecentPayments().map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <DollarSign className="text-green-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {payment.driverId?.name || 'Unknown Driver'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500 capitalize">{payment.paymentMethod}</p>
                    </div>
                  </div>
                ))}
                {getRecentPayments().length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent payments</p>
                )}
              </div>
            </div>

            {/* Expiring Contracts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Contracts Expiring Soon</h2>
                <Link to="/contracts/list" className="text-blue-600 text-sm hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {getExpiringContracts().map((contract) => (
                  <div key={contract._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <AlertTriangle className="text-orange-600" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {contract.driverId?.firstName ? `${contract.driverId.firstName} ${contract.driverId.lastName}` : 'Unknown Driver'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(contract.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-orange-600">
                        {Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                ))}
                {getExpiringContracts().length === 0 && (
                  <p className="text-gray-500 text-center py-4">No contracts expiring soon</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Statistics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Vehicle Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {types.map((t) => (
                <div key={t.value} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">{t.icon}</div>
                  <p className="text-sm text-gray-600 mb-1">{t.label}</p>
                  <p className="text-xl font-bold text-gray-800">{countByType(t.value)}</p>
                </div>
              ))}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Car className="text-blue-600" size={20} />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                <p className="text-xl font-bold text-gray-800">{vehicles.length}</p>
              </div>
            </div>
          </div>

          {/* Contract Status Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Contract Status Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-2xl font-bold text-green-800">{getContractsByStatus('active').length}</span>
                </div>
                <p className="text-sm font-medium text-green-700">Active Contracts</p>
                <p className="text-xs text-green-600">Currently running</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-gray-600" size={20} />
                  <span className="text-2xl font-bold text-gray-800">{getContractsByStatus('pending').length}</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Pending Contracts</p>
                <p className="text-xs text-gray-600">Awaiting activation</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="text-red-600" size={20} />
                  <span className="text-2xl font-bold text-red-800">{getContractsByStatus('terminated').length}</span>
                </div>
                <p className="text-sm font-medium text-red-700">Terminated Contracts</p>
                <p className="text-xs text-red-600">Ended or cancelled</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}