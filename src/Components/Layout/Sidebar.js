import {
  Home,
  Users,
  DollarSign,
  Settings,
  Calendar,
  Car,
  LogOut,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../APIS/APIS";

export default function Sidebar({ toggleMobileMenu, mobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/apartments/dashboard" },
    { label: "Properties", icon: <Home size={18} />, path: "/apartments/list" },
    { label: "Tenants", icon: <Users size={18} />, path: "/apartments/tenants" },
    { label: "Payments", icon: <DollarSign size={18} />, path: "/apartments/payment/list" },
    { label: "Go To Vehicle Dashboard", icon: <Car size={18} />, path: "/vehicles/dashboard" },
    { label: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  const manageItems = [
   /* { label: "Maintenance", icon: <Settings size={18} />, path: "/maintenance" },*/
   /* { label: "Calendar", icon: <Calendar size={18} />, path: "/calendar" },*/
    { label: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  const handleLogout = async() => {
    try {
      
        navigate('/')
      
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block flex flex-col`}
      >
        {/* Close Icon (Mobile only) */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={toggleMobileMenu}>
            <X size={24} className="text-gray-700 hover:text-red-600" />
          </button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">Property Manager</h2>
          <Section title="Main" items={navItems} currentPath={location.pathname} navigate={navigate} />
          {/*<Section title="Management" items={manageItems} currentPath={location.pathname} navigate={navigate} />*/}
        </div>

        {/* Logout */}
        <div className="p-3 mt-15 border-t border-gray-200">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 w-full text-red-600 hover:bg-red-50 px-4 py-2 rounded-md"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, items, currentPath, navigate }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </div>
      <ul>
        {items.map(({ label, icon, path }) => (
          <li
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer mb-1 transition-all
              ${
                currentPath === path
                  ? "bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600"
                  : "hover:bg-gray-100"
              }`}
          >
            {icon}
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}