// frontend/src/components/DeliveryInfoModal.jsx

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function DeliverInfoModel({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    fullAddress: '',
    city: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number required';
    } else if (!/^(?:\+33|0)[1-9]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number (e.g., +33612345678)';
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Address required';
    } else if (formData.fullAddress.length < 10) {
      newErrors.fullAddress = 'Address must be at least 10 characters';
    }

    if (formData.zipCode && !/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Zip code must be 5 digits';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setValidating(true);
      await onSubmit(formData);
    } finally {
      setValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-8 flex justify-between items-center sticky top-0">
          <div>
            <h2 className="text-3xl font-bold">📍 Delivery Address</h2>
            <p className="text-pink-100 mt-1">Enter your delivery information</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:scale-125 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={`input-base rounded-xl ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">❌ {errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`input-base rounded-xl ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">❌ {errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📱 Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+33612345678"
              className={`input-base rounded-xl ${errors.phoneNumber ? 'border-red-500' : ''}`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.phoneNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Format: +33612345678 or 0612345678</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏠 Street Address
            </label>
            <input
              type="text"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              placeholder="123 Rue de la Paix, Apt 45"
              className={`input-base rounded-xl ${errors.fullAddress ? 'border-red-500' : ''}`}
            />
            {errors.fullAddress && (
              <p className="text-red-500 text-sm mt-1">❌ {errors.fullAddress}</p>
            )}
          </div>

          {/* City & Zip */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏙️ City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Paris"
                className="input-base rounded-xl"
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📮 Zip Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="75001"
                maxLength="5"
                className={`input-base rounded-xl ${errors.zipCode ? 'border-red-500' : ''}`}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">❌ {errors.zipCode}</p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> Make sure your address is correct. We cannot change it after order placement.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || validating}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || validating}
              className="flex-1 bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {loading || validating ? (
                '🔄 Processing...'
              ) : (
                '✨ Confirm & Place Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}