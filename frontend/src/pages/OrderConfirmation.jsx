// frontend/src/pages/OrderConfirmation.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(id);
      setOrder(res.data.order);
    } catch (error) {
      console.error('🔴 [OrderConfirmation] fetchOrder error:', error);
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-6 animate-bounce">✨</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase. Your beauty products are on their way!
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8">
          {/* Order Number */}
          <div className="text-center bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-4xl font-bold text-pink-600">#{order.id}</p>
            <p className="text-sm text-gray-600 mt-2">
              📅 {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-lg text-gray-800">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryInfo && (
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                📍 Delivery Address
              </h3>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">
                  {order.deliveryInfo.first_name} {order.deliveryInfo.last_name}
                </p>
                <p>{order.deliveryInfo.full_address}</p>
                <p>
                  {order.deliveryInfo.city} {order.deliveryInfo.zip_code}
                </p>
                <p>📱 {order.deliveryInfo.phone_number}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${parseFloat(order.total_price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${(order.total_price * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-3">
              <span className="font-bold text-lg">Total Paid</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                ${(order.total_price * 1.1).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-bold text-lg text-gray-800 mb-4">📦 Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-gray-800">Order Placed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  ['CONFIRMEE', 'EXPEDIEE', 'LIVREE'].includes(order.status)
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}>
                  {['CONFIRMEE', 'EXPEDIEE', 'LIVREE'].includes(order.status) ? '✓' : '◌'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Order Confirmed</p>
                  <p className="text-sm text-gray-600">We'll process soon</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  ['EXPEDIEE', 'LIVREE'].includes(order.status)
                    ? 'bg-pink-500'
                    : 'bg-gray-300'
                }`}>
                  {['EXPEDIEE', 'LIVREE'].includes(order.status) ? '✓' : '◌'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Order Shipped</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  order.status === 'LIVREE' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {order.status === 'LIVREE' ? '✓' : '◌'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Delivered</p>
                  <p className="text-sm text-gray-600">Expected in 3-5 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/"
              className="text-center bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
            >
              Continue Shopping
            </Link>
            <Link
              to="/my-orders"
              className="text-center border-2 border-pink-300 text-pink-600 font-bold py-3 rounded-xl hover:bg-pink-50 transition"
            >
              View All Orders
            </Link>
          </div>

          {/* Info Box */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> A confirmation email has been sent to your email address. You can track your order status in "My Orders" anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}