// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(email, password);
      
      if (res.data.success) {
        login(res.data.user, res.data.accessToken);
        toast.success('Logged in successfully! 💄');
        navigate('/');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Decorative Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your beauty account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-base rounded-xl"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔐 Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Logging in...' : '✨ Sign In'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-transparent bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-pink-200">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Demo Account:</strong> test@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
