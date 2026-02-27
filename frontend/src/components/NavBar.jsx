import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isOnAdmin = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const linkClass = (path) => {
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return `transition font-medium ${active ? 'text-pink-600 font-bold' : 'text-gray-700 hover:text-pink-600'}`;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link to={isAdmin && isOnAdmin ? '/admin/dashboard' : '/'} className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
          💄 Mezyena
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-2xl text-gray-600 hover:text-pink-600"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-5 items-center">
          {/* Admin-specific nav */}
          {isAdmin && isOnAdmin ? (
            <>
              <Link to="/" className={linkClass('/')}>
                🏠 Store
              </Link>
              <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                🛠️ Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className={linkClass('/')}>
                Home
              </Link>

              {user && (
                <>
                  <Link to="/my-orders" className={linkClass('/my-orders')}>
                    My Orders
                  </Link>
                  <Link to="/account" className={linkClass('/account')}>
                    Account
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  ⚙️ Admin
                </Link>
              )}
            </>
          )}

          {/* Auth buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-full text-sm font-bold hover:shadow-lg transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="px-4 py-1.5 border border-pink-500 text-pink-600 rounded-full text-sm font-bold hover:bg-pink-50 transition">
                Login
              </Link>
              <Link to="/register" className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-full text-sm font-bold hover:shadow-lg transition">
                Register
              </Link>
            </>
          )}

          {/* Cart (hide when on admin pages) */}
          {!isOnAdmin && (
            <Link to="/cart" className="text-2xl hover:text-pink-600 transition relative">
              🛒
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
          {isAdmin && isOnAdmin ? (
            <>
              <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                🏠 Store
              </Link>
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                🛠️ Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                Home
              </Link>
              {user && (
                <>
                  <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                    My Orders
                  </Link>
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                    Account
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                  ⚙️ Admin
                </Link>
              )}
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-pink-600 font-medium">
                🛒 Cart
              </Link>
            </>
          )}

          {user ? (
            <button
              onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-full text-sm font-bold"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 border border-pink-500 text-pink-600 rounded-full text-sm font-bold">
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-full text-sm font-bold">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}