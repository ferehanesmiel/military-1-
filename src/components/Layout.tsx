import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, Users, Box, Shield, BarChart3, FileText, LogOut } from 'lucide-react';
import { useState } from 'react';

export const Layout = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/personnel', label: 'Personnel', icon: Users },
    { path: '/units', label: 'Units', icon: Shield },
    { path: '/materials', label: 'Materials', icon: Box },
    { path: '/analysis', label: 'Analysis', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  if (userData?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: Shield });
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Sidebar for desktop */}
      <nav className="hidden md:flex w-64 bg-stone-900 text-white p-6 flex-col">
        <h1 className="text-xl font-bold mb-8 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Military Org
        </h1>
        <div className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-stone-900 text-white flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Military Org
        </h1>
        <button onClick={toggleMenu} className="p-2">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-stone-900 z-40 pt-20 px-6 flex flex-col">
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg ${
                  location.pathname === item.path
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-400'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-6 text-stone-400 border-t border-stone-800 mt-auto"
          >
            <LogOut className="w-6 h-6" />
            Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
