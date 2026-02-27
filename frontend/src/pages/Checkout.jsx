// frontend/src/pages/Checkout.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import DeliverInfoModel from '../components/DeliverInfoModel';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setCart(res.data.cart);
      if (res.data.cart.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
      }
    } catch (error) {
      console.error('🔴 [Checkout] fetchCart error:', error);
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (deliveryInfo) => {
    try {
      setCreating(true);
      const res = await orderService.createOrder(cart.id, deliveryInfo);

      if (res.data.success) {
        toast.success('✨ Order placed successfully!');
        navigate(`/order-confirmation/${res.data.order.id}`);
      }
    } catch (error) {
      console.error('🔴 [Checkout] createOrder error:', error);
      const data = error.response?.data;
      if (data?.stockErrors && data.stockErrors.length > 0) {
        data.stockErrors.forEach((err) => {
          toast.error(
            `${err.productName}: only ${err.available} left in stock (you requested ${err.requested})`,
            { duration: 6000 }
          );
        });
      } else {
        const errorMsg = data?.message || 'Failed to create order';
        toast.error(errorMsg);
      }
    } finally {
      setCreating(false);
      setShowDeliveryModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-2xl text-gray-800 mb-6">Your cart is empty</p>
        </div>
      </div>
    );
  }

  const subtotal = cart.total;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 5;
  const total = subtotal + tax + shipping;
  const hasStockIssue = cart.items.some(
    (item) => item.stock !== undefined && item.quantity > item.stock
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          🛍️ Order Review
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Items</h2>
            
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex gap-6 relative"
              >
                {/* Stock warning */}
                {item.stock !== undefined && item.quantity > item.stock && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                    ⚠️ Only {item.stock} in stock
                  </div>
                )}

                {/* Product Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-4xl">💄</span>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Qty: <span className="font-bold">{item.quantity}</span>
                  </p>
                  <p className="text-gray-600">
                    Unit Price: <span className="font-bold">${parseFloat(item.price).toFixed(2)}</span>
                  </p>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-2">Subtotal</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  {item.stock !== undefined && item.quantity > item.stock && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      Stock insuffisant
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📍 Delivery Address
              </h2>
              <p className="text-gray-600 mb-6">
                Click the button below to enter your delivery address
              </p>
              <button
                onClick={() => setShowDeliveryModal(true)}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition"
              >
                📝 Enter Delivery Address
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>

              {/* Breakdown */}
              <div className="space-y-3 py-4 border-y border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={() => setShowDeliveryModal(true)}
                disabled={creating || hasStockIssue}
                className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50"
              >
                {creating ? '🔄 Processing...' : hasStockIssue ? '⚠️ Stock insuffisant' : '🎉 Place Order'}
              </button>

              {/* Info */}
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200 space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>✓</strong> Secure checkout
                </p>
                <p className="text-sm text-gray-700">
                  <strong>✓</strong> Real-time order tracking
                </p>
                <p className="text-sm text-gray-700">
                  <strong>✓</strong> 30-day returns
                </p>
              </div>

              {/* Customer Info */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Logged in as:</strong>
                </p>
                <p className="font-bold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Info Modal */}
      <DeliverInfoModel
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSubmit={handleCreateOrder}
        loading={creating}
      />
    </div>
  );
}