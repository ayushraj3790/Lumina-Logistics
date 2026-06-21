import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const dash = user ? ROLE_DASHBOARD[user.role] : '/login';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lumina-500 to-accent text-white font-bold flex items-center justify-center">L</div>
          <span className="font-bold text-lg text-white">Lumina Logistics</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-white/90">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#ai" className="hover:text-white">AI</a>
          <a href="#how" className="hover:text-white">How it Works</a>
          <Link to="/track" className="hover:text-white">Track</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggle} className="p-2 text-white/80 hover:text-white">{dark ? <FiSun /> : <FiMoon />}</button>
          <Link to={dash} className="btn-primary text-sm py-2 px-5">{user ? 'Dashboard' : 'Get Started'}</Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button>
      </div>
      {open && (
        <div className="md:hidden mt-2 glass rounded-xl p-4 flex flex-col gap-3 text-white">
          <a href="#features">Features</a>
          <Link to="/track">Track</Link>
          <Link to={dash} className="btn-primary text-center">Get Started</Link>
        </div>
      )}
    </motion.nav>
  );
}
