// frontend/src/pages/ProductDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      setProduct(res.data.product);
    } catch (error) {
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      setAdding(true);
      await cartService.addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart! 🛒`);
      setQuantity(1);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add to cart';
      toast.error(errorMsg);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="text-pink-600 hover:underline mb-6 flex items-center gap-2"
        >
          ← Back to Shop
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition duration-300"
                />
              ) : (
                <div className="text-9xl">💄</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="inline-block">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                {product.category_name || 'Cosmetics'}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-gray-600">(4.8 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 border-2 border-pink-200">
              <p className="text-gray-600 text-sm mb-2">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-gray-500 line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-green-600 mt-2">✓ Save 17%</p>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-2xl p-6">
              <p className="text-gray-600 text-sm mb-2">Availability</p>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <p className="font-semibold text-green-600">
                    In Stock - {product.stock} available
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <p className="font-semibold text-red-600">Out of Stock</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-3">About this product</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full border-2 border-pink-300 text-pink-600 font-bold hover:bg-pink-100 transition"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-gray-800 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 rounded-full border-2 border-pink-300 text-pink-600 font-bold hover:bg-pink-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition text-white ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 hover:shadow-lg'
              }`}
            >
              {adding ? '🔄 Adding...' : '✨ Add to Cart'}
            </button>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚚</span>
                <span className="text-gray-600">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💯</span>
                <span className="text-gray-600">100% authentic cosmetics</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">↩️</span>
                <span className="text-gray-600">30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}