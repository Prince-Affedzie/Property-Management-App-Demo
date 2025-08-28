import { Bell, Menu, X, Home, Users, Banknote, Search, ChevronDown, User } from 'lucide-react';
import { useProfileContext } from '../../Context/fetchProfileContext';
import { useEffect,useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function TopNav({ toggleMobileMenu, mobileMenuOpen }) {
  const { profile, getProfile } = useProfileContext();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('GHC');
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Branding and Navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button onClick={toggleMobileMenu} className="md:hidden mr-4">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Branding */}
            <h1 className="text-xl font-bold text-indigo-600 mr-8">Kassie Homes</h1>
            
            {/* Main Navigation Links */}
            <nav   style={{
             display: windowWidth >= 1024 ? 'flex' : 'none',
            }} className="space-x-1">
              <Link
                to="/apartments/dashboard"
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${isActive('/apartments/dashboard') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Home className="mr-2 h-4 w-4" />
                Overview
              </Link>
              <Link
                to="/apartments/tenants"
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${isActive('/apartments/tenants') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users className="mr-2 h-4 w-4" />
                Tenants
              </Link>
              <Link
                to="/apartments/list"
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${isActive('/apartments/list') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Home className="mr-2 h-4 w-4" />
                Properties
              </Link>
              <Link
                to="/apartments/payment/list"
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${isActive('/apartments/payment/list') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Finance
              </Link>
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative hidden md:block">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="GHC">GHC</option>
                <option value="USD">USD</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <button className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
              <Bell className="h-5 w-5" />
            </button>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                {profile?.name ? (
                  <div className="h-8 w-8 bg-blue-600 text-white font-medium rounded-full flex items-center justify-center">
                    {profile.name.slice(0, 2)}
                  </div>
                ) : (
                  <User className="h-8 w-8 rounded-full bg-gray-200 p-1 text-gray-600" />
                )}
              </div>
              <div className="hidden md:block ml-3 leading-tight">
                <p className="font-medium">{profile?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{profile?.role || 'Role'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Links 
        <div className="md:hidden flex overflow-x-auto pt-3">
          <Link
            to="/dashboard"
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${isActive('/dashboard') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Overview
          </Link>
          <Link
            to="/tenants"
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${isActive('/tenants') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Tenants
          </Link>
          <Link
            to="/properties"
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${isActive('/properties') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Properties
          </Link>
          <Link
            to="/finance"
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${isActive('/finance') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Finance
          </Link>
        </div>*/}
      </div>
    </header>
  );
}