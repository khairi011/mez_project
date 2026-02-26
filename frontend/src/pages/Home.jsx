// frontend/src/pages/Home.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAllProducts(),
        productService.getAllCategories(),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const res = await productService.searchProducts(searchQuery);
      if (res.data.products.length === 0) {
        toast('No products found for your search', { icon: '🔍' });
      }
      setProducts(res.data.products);
      setSelectedCategory(null);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    try {
      setLoading(true);
      if (categoryId === null) {
        await fetchInitialData();
      } else {
        const res = await productService.getProductsByCategory(categoryId);
        setProducts(res.data.products);
      }
      setSelectedCategory(categoryId);
      setSearchQuery('');
    } catch (error) {
      toast.error('Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">✨ Cosmetics Paradise</h1>
          <p className="text-xl text-pink-100">Discover your perfect beauty products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for your favorite cosmetics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-5 pr-14 py-4 text-lg rounded-full shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md border-2 border-pink-200'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:shadow-md border-2 border-pink-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <div className="card group overflow-hidden hover:scale-105 transform transition duration-300 cursor-pointer h-full">
                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pink-300 text-5xl">
                        💄
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                        {product.category_name || 'Cosmetics'}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition">
                      <p className="text-lg font-bold">View Details</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-600 mb-4">😢 No products found</p>
            <button
              onClick={() => handleCategoryFilter(null)}
              className="btn-primary"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
