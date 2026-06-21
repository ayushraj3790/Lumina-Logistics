import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiPackage, FiTruck, FiUsers, FiBell, FiLogOut, FiSun, FiMoon,
  FiMessageCircle, FiCreditCard, FiBox, FiBarChart2,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROLE_DASHBOARD } from '../utils/constants';

const navByRole = {
  customer: [
    { to: '/dashboard/customer', icon: FiHome, label: 'Overview' },
    { to: '/dashboard/customer/book', icon: FiPackage, label: 'Book Shipment' },
    { to: '/dashboard/customer/shipments', icon: FiTruck, label: 'My Shipments' },
    { to: '/dashboard/customer/payments', icon: FiCreditCard, label: 'Payments' },
    { to: '/dashboard/customer/chat', icon: FiMessageCircle, label: 'AI Assistant' },
  ],
  driver: [
    { to: '/dashboard/driver', icon: FiHome, label: 'Overview' },
    { to: '/dashboard/driver/deliveries', icon: FiTruck, label: 'Deliveries' },
    { to: '/dashboard/driver/routes', icon: FiBox, label: 'Routes' },
  ],
  admin: [
    { to: '/dashboard/admin', icon: FiHome, label: 'Overview' },
    { to: '/dashboard/admin/shipments', icon: FiPackage, label: 'Shipments' },
    { to: '/dashboard/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/dashboard/admin/warehouses', icon: FiBox, label: 'Warehouses' },
    { to: '/dashboard/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  ],
  warehouse: [
    { to: '/dashboard/warehouse', icon: FiHome, label: 'Overview' },
    { to: '/dashboard/warehouse/scan', icon: FiPackage, label: 'Scan Package' },
    { to: '/dashboard/warehouse/inventory', icon: FiBox, label: 'Inventory' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const nav = navByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <aside className="w-64 hidden lg:flex flex-col glass border-r border-slate-200/50 dark:border-slate-800 p-4">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lumina-500 to-accent flex items-center justify-center text-white font-bold">L</div>
          <span className="font-bold text-lg">Lumina</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROLE_DASHBOARD[user?.role]}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-lumina-600 text-white' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800'}`
              }
            >
              <item.icon /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 pt-4 border-t dark:border-slate-800">
          <Link to="/track" className="flex items-center gap-3 px-4 py-2 text-sm text-lumina-600">Track Package</Link>
          <button onClick={toggle} className="flex items-center gap-3 px-4 py-2 w-full rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800">
            {dark ? <FiSun /> : <FiMoon />} Theme
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-red-500 hover:bg-red-500/10">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-3 py-1 rounded-full bg-lumina-500/20 text-lumina-600 capitalize">{user?.role}</span>
            <FiBell className="text-xl text-slate-500" />
          </div>
        </header>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-6 overflow-auto">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
