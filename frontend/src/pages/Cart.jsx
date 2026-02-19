// frontend/src/pages/Cart.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setCart(res.data.cart);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(cartItemId);
      await cartService.updateCartItem(cartItemId, newQuantity);
      await fetchCart();
      toast.success('Cart updated!');
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      setUpdating(cartItemId);
      await cartService.removeFromCart(cartItemId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await cartService.clearCart();
        setCart({ items: [], total: 0, itemCount: 0 });
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-2xl text-gray-800 mb-6">Please login to view your cart</p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            ✨ Shopping Cart
          </h1>

          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-2xl text-gray-600 mb-6">Your cart is empty</p>
            <Link to="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          ✨ Shopping Cart ({cart.itemCount} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex gap-6 hover:shadow-xl transition"
              >
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

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    ${item.price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 rounded-full border-2 border-pink-300 text-pink-600 hover:bg-pink-100 transition disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="font-bold text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 rounded-full border-2 border-pink-300 text-pink-600 hover:bg-pink-100 transition disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updating === item.id}
                    className="text-red-500 hover:text-red-700 font-semibold transition disabled:opacity-50"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>

              {/* Totals */}
              <div className="space-y-3 py-4 border-y border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${(cart.total * 0.1).toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  ${(cart.total * 1.1).toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition"
              >
                🛍️ Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-pink-300 text-pink-600 font-bold py-3 rounded-2xl hover:bg-pink-50 transition"
              >
                Continue Shopping
              </button>

              {/* Clear Cart */}
              <button
                onClick={handleClearCart}
                className="w-full text-red-500 hover:text-red-700 font-semibold transition"
              >
                Clear Cart
              </button>

              {/* Promo Code */}
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                <p className="text-sm text-gray-600 mb-2">💝 Have a promo code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none"
                  />
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-700">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}