// frontend/src/pages/NotFound.jsx

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* 404 */}
        <div className="space-y-4">
          <h1 className="text-9xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-6xl">😕</p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-gray-800">Oops! Page Not Found</h2>
          <p className="text-xl text-gray-600">
            It looks like this beauty page went missing!
          </p>
        </div>

        {/* Action */}
        <div className="space-y-3">
          <p className="text-gray-600">Don't worry, let's get you back to shopping</p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-lg transition"
          >
            🏠 Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-8">
          <Link
            to="/"
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition text-gray-700 font-semibold"
          >
            Shop
          </Link>
          <Link
            to="/login"
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition text-gray-700 font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}