// frontend/src/pages/MyOrders.jsx

import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors = {
  EN_ATTENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
  CONFIRMEE: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✓ Confirmed' },
  EXPEDIEE: { bg: 'bg-purple-100', text: 'text-purple-800', label: '📦 Shipped' },
  LIVREE: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Delivered' },
  ANNULEE: { bg: 'bg-red-100', text: 'text-red-800', label: '✕ Cancelled' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      setOrders(res.data.orders);
    } catch (error) {
      console.error('🔴 [MyOrders] fetchOrders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      console.error('🔴 [MyOrders] cancelOrder error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          📦 My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-2xl text-gray-600 mb-6">No orders yet</p>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = statusColors[order.status] || statusColors.EN_ATTENTE;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {/* Order Header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          Order #{order.id}
                        </h3>
                        <span
                          className={`px-4 py-2 rounded-full font-bold ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        📅 {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        ${parseFloat(order.total_price).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-2xl ml-4">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 space-y-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-4">Items</h4>
                        <div className="space-y-3">
                          {order.items && order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                </p>
                              </div>
                              <p className="font-bold text-gray-800">
                                ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      {order.deliveryInfo && (
                        <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                          <h4 className="font-bold text-gray-800 mb-3">
                            📍 Delivery Address
                          </h4>
                          <p className="text-gray-700">
                            {order.deliveryInfo.first_name} {order.deliveryInfo.last_name}
                          </p>
                          <p className="text-gray-700">
                            {order.deliveryInfo.full_address}
                          </p>
                          <p className="text-gray-700">
                            {order.deliveryInfo.city} {order.deliveryInfo.zip_code}
                          </p>
                          <p className="text-gray-700">
                            📱 {order.deliveryInfo.phone_number}
                          </p>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${parseFloat(order.total_price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (10%)</span>
                          <span>${(parseFloat(order.total_price) * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-2 font-bold">
                          <span>Total</span>
                          <span>${(parseFloat(order.total_price) * 1.1).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {['EN_ATTENTE', 'CONFIRMEE'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
                        >
                          ✕ Cancel Order
                        </button>
                      )}

                      {order.status === 'LIVREE' && (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                          <p className="text-green-700 font-bold">
                            ✓ Your order has been delivered!
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            We hope you enjoy your cosmetics! 💄
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}