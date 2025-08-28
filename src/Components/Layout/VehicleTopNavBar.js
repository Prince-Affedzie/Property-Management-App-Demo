import { Bell, Menu, X, Search, ChevronDown, User, LayoutDashboard, CarFront, Users, FileText, DollarSign, Wrench, Home } from 'lucide-react';
import { useProfileContext } from '../../Context/fetchProfileContext';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function VehicleTopNav({ toggleMobileMenu, mobileMenuOpen }) {
  const { profile, getProfile } = useProfileContext();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (!profile) {
      getProfile();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to check active link
  const isActive = (path) => location.pathname === path;

  // Navigation items matching the sidebar
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/vehicles/dashboard" },
    { label: "Vehicles", icon: <CarFront size={16} />, path: "/vehicles/list" },
    { label: "Drivers", icon: <Users size={16} />, path: "/driver/list" },
    { label: "Contracts", icon: <FileText size={16} />, path: "/contracts/list" },
    { label: "Payments", icon: <DollarSign size={16} />, path: "/contract_payment/list" },
    { label: "Maintenance", icon: <Wrench size={16} />, path: "/vehicle/maintainance_list" },
    { label: "Apartments", icon: <Home size={16} />, path: "/apartments/dashboard" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 mb-2"> {/* Increased z-index to 40 */}
      <div className="px-4 py-3 ">
        <div className="flex items-center justify-between">
          {/* Left side - Branding and Navigation */}
          <div className="flex items-center">
            {/* Mobile menu button - Increased z-index and fixed positioning */}
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden mr-4 relative z-50" // Increased z-index to 50
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Branding */}
            <h1 className="text-xl font-bold text-blue-600 mr-8">Vehicle Manager</h1>
            
            {/* Main Navigation Links */}
            <nav style={{
              display: windowWidth >= 1024 ? 'flex' : 'none',
            }} className="space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side controls - commented out */}
        </div>

        {/* Mobile Navigation Links - Horizontal scroll */}
       {/* <div className="md:hidden flex overflow-x-auto pt-3 space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md flex items-center whitespace-nowrap ${
                isActive(item.path) 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>*/}
      </div>
    </header>
  );
}