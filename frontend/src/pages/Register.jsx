// frontend/src/pages/Register.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (res.data.success) {
        login(res.data.user, res.data.accessToken);
        toast.success('Welcome to Cosmetics Paradise! 💄✨');
        navigate('/');
      }
    } catch (error) {
      console.error('🔴 [Register] error:', error);
      const errorMsg = error.response?.data?.message || 'Registration failed';
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
          <div className="text-6xl mb-4">💄</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Join Us
          </h1>
          <p className="text-gray-600 mt-2">Create your beauty account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="input-base rounded-xl"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✓ Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-base rounded-xl"
            />
          </div>

          {/* Register Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? '🔄 Creating account...' : '✨ Create Account'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-transparent bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 space-y-3">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-pink-200 flex items-center gap-3">
            <span className="text-2xl">🛍️</span>
            <span className="text-sm text-gray-600">Access exclusive cosmetics</span>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-pink-200 flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <span className="text-sm text-gray-600">Fast delivery to your door</span>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-pink-200 flex items-center gap-3">
            <span className="text-2xl">💝</span>
            <span className="text-sm text-gray-600">Special beauty rewards</span>
          </div>
        </div>
      </div>
    </div>
  );
}