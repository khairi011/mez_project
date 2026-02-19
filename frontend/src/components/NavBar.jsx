import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          🛍️ E-Commerce
        </Link>

        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/my-orders" className="hover:text-blue-600">
                My Orders
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="hover:text-blue-600">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn-primary text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Register
              </Link>
            </>
          )}

          <Link to="/cart" className="text-2xl hover:text-blue-600">
            🛒
          </Link>
        </div>
      </div>
    </nav>
  );
}