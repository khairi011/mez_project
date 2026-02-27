import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  CONFIRMEE:  { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: '✓' },
  EXPEDIEE:   { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: '📦' },
  LIVREE:     { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: '✅' },
  ANNULEE:    { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: '✕' },
};

const TABS = [
  { id: 'stats', label: '📊 Dashboard', },
  { id: 'orders', label: '📦 Commandes' },
  { id: 'products', label: '🛍️ Produits' },
  { id: 'categories', label: '📂 Catégories' },
  { id: 'users', label: '👤 Utilisateurs' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // Products
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Categories
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  // Users
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    } else {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') { fetchProducts(); fetchCategories(); }
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [orderFilter]);

  // ============ FETCH FUNCTIONS ============
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error('🔴 [Admin] fetchStats error:', error);
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let res;
      if (orderFilter === 'ALL') {
        res = await adminService.getAllOrders(0, 100);
      } else {
        res = await adminService.getOrdersByStatus(orderFilter);
      }
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('🔴 [Admin] fetchOrders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getAllProducts(0, 200);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('🔴 [Admin] fetchProducts error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productService.getAllCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('🔴 [Admin] fetchCategories error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers(0, 200);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('🔴 [Admin] fetchUsers error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // ============ ORDER ACTIONS ============
  const toggleOrderExpand = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await adminService.getOrderDetails(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.data.order }));
      } catch (error) {
        console.error('🔴 [Admin] fetchOrderDetails error:', error);
        toast.error('Failed to load order details');
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success(`Commande #${orderId} → ${STATUS_CONFIG[newStatus].label}`);
      fetchOrders();
    } catch (error) {
      console.error('🔴 [Admin] updateStatus error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // ============ PRODUCT ACTIONS ============
  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' });
    setEditingProduct(null);
    setShowProductForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.image_url || '',
      categoryId: String(product.category_id || ''),
    });
    setImageFile(null);
    setImagePreview(product.image_url || null);
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5 MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setProductForm({ ...productForm, imageUrl: '' }); // clear URL if file is chosen
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error('Name, price and category are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', parseFloat(productForm.price));
      formData.append('stock', parseInt(productForm.stock) || 0);
      formData.append('categoryId', parseInt(productForm.categoryId));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (productForm.imageUrl) {
        formData.append('imageUrl', productForm.imageUrl);
      }

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
        toast.success('Product updated');
      } else {
        await adminService.createProduct(formData);
        toast.success('Product created');
      }
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('🔴 [Admin] saveProduct error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await adminService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('🔴 [Admin] deleteProduct error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // ============ CATEGORY ACTIONS ============
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setEditingCategory(cat);
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) { toast.error('Category name required'); return; }
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated');
      } else {
        await adminService.createCategory(categoryForm);
        toast.success('Category created');
      }
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('🔴 [Admin] saveCategory error:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      console.error('🔴 [Admin] deleteCategory error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // ============ USER ACTIONS ============
  const handleDeleteUser = async (id, name) => {
    if (id === user.id) { toast.error("You can't delete yourself"); return; }
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('🔴 [Admin] deleteUser error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // ============ RENDER HELPERS ============
  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '?' };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const getNextStatuses = (current) => {
    const flow = {
      EN_ATTENTE: ['CONFIRMEE', 'ANNULEE'],
      CONFIRMEE: ['EXPEDIEE', 'ANNULEE'],
      EXPEDIEE: ['LIVREE'],
      LIVREE: [],
      ANNULEE: [],
    };
    return flow[current] || [];
  };

  // ============ TAB CONTENT ============

  const renderStats = () => {
    if (!stats) return <p className="text-gray-500">No stats available</p>;
    const cards = [
      { label: 'Total Users', value: stats.users, icon: '👤', color: 'from-blue-500 to-blue-600' },
      { label: 'Total Products', value: stats.products, icon: '🛍️', color: 'from-purple-500 to-purple-600' },
      { label: 'Total Categories', value: stats.categories, icon: '📂', color: 'from-pink-500 to-pink-600' },
      { label: 'Total Orders', value: stats.orders?.total || 0, icon: '📦', color: 'from-amber-500 to-amber-600' },
      { label: 'Revenue (Livrée)', value: `$${parseFloat(stats.orders?.revenue || 0).toFixed(2)}`, icon: '💰', color: 'from-green-500 to-green-600' },
    ];

    const statusCards = [
      { status: 'EN_ATTENTE', value: stats.orders?.byStatus?.enAttente || 0 },
      { status: 'CONFIRMEE', value: stats.orders?.byStatus?.confirmee || 0 },
      { status: 'EXPEDIEE', value: stats.orders?.byStatus?.expediee || 0 },
      { status: 'LIVREE', value: stats.orders?.byStatus?.livree || 0 },
    ];

    return (
      <div className="space-y-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-6 shadow-lg`}>
              <p className="text-3xl mb-1">{c.icon}</p>
              <p className="text-sm opacity-80">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Orders by Status */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Orders by Status</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statusCards.map((s) => (
              <div key={s.status} className="bg-white rounded-xl p-4 shadow border-l-4 border-current">
                <StatusBadge status={s.status} />
                <p className="text-3xl font-bold text-gray-800 mt-2">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', ...Object.keys(STATUS_CONFIG)].map((s) => (
          <button
            key={s}
            onClick={() => { setOrderFilter(s); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              orderFilter === s
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                : 'bg-white text-gray-700 border border-gray-300 hover:shadow'
            }`}
          >
            {s === 'ALL' ? '📋 All' : `${STATUS_CONFIG[s].icon} ${STATUS_CONFIG[s].label}`}
          </button>
        ))}
        <button onClick={fetchOrders} className="ml-auto px-4 py-2 rounded-full text-sm font-bold bg-gray-100 hover:bg-gray-200 transition">
          🔄 Refresh
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📭</p>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Order Header */}
              <div
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleOrderExpand(order.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-800">#{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>User #{order.user_id}</span>
                  <span className="font-bold text-lg text-gray-800">
                    ${parseFloat(order.total_price || 0).toFixed(2)}
                  </span>
                  <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="text-gray-400">{expandedOrder === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-4">
                  {/* Items */}
                  {orderDetails[order.id]?.items && orderDetails[order.id].items.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Products</h4>
                      <div className="space-y-2">
                        {orderDetails[order.id].items.map((item, i) => (
                          <div key={i} className="flex justify-between bg-white rounded-lg p-3">
                            <span>{item.name} x{item.quantity}</span>
                            <span className="font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Info */}
                  {orderDetails[order.id]?.deliveryInfo && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Delivery Info</h4>
                      <div className="bg-white rounded-lg p-3 text-sm space-y-1">
                        <p><strong>Name:</strong> {orderDetails[order.id].deliveryInfo.first_name} {orderDetails[order.id].deliveryInfo.last_name}</p>
                        <p><strong>Phone:</strong> {orderDetails[order.id].deliveryInfo.phone_number}</p>
                        <p><strong>Address:</strong> {orderDetails[order.id].deliveryInfo.full_address}</p>
                        {orderDetails[order.id].deliveryInfo.city && <p><strong>City:</strong> {orderDetails[order.id].deliveryInfo.city}</p>}
                        {orderDetails[order.id].deliveryInfo.zip_code && <p><strong>Zip:</strong> {orderDetails[order.id].deliveryInfo.zip_code}</p>}
                      </div>
                    </div>
                  )}

                  {!orderDetails[order.id] && (
                    <p className="text-gray-400 text-sm">Loading details...</p>
                  )}

                  {/* Status Actions */}
                  {getNextStatuses(order.status).length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Change Status</h4>
                      <div className="flex gap-2">
                        {getNextStatuses(order.status).map((ns) => (
                          <button
                            key={ns}
                            onClick={() => handleUpdateStatus(order.id, ns)}
                            disabled={updatingOrder === order.id}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 ${
                              ns === 'ANNULEE'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {updatingOrder === order.id ? '...' : `→ ${STATUS_CONFIG[ns].icon} ${STATUS_CONFIG[ns].label}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">
          {products.length} products
        </h3>
        <button
          onClick={() => { resetProductForm(); setShowProductForm(true); }}
          className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition"
        >
          + Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">
            {editingProduct ? `Edit: ${editingProduct.name}` : 'New Product'}
          </h4>
          <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input
                type="text" value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="input-base rounded-lg" placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="input-base rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price *</label>
              <input
                type="number" step="0.01" value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="input-base rounded-lg" placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
              <input
                type="number" value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="input-base rounded-lg" placeholder="100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
              <div className="flex items-start gap-4">
                {/* Image preview */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border-2 border-pink-200" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); setProductForm({ ...productForm, imageUrl: '' }); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-3xl text-gray-400 border-2 border-dashed border-gray-300">
                      📷
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {/* File upload */}
                  <label className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg cursor-pointer hover:bg-pink-100 transition font-bold text-sm border border-pink-200 w-fit">
                    📁 Upload Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500">Max 5 MB — JPEG, PNG, GIF, WebP</p>
                  {/* Or paste URL */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">or paste URL:</span>
                    <input
                      type="text" value={productForm.imageUrl}
                      onChange={(e) => {
                        setProductForm({ ...productForm, imageUrl: e.target.value });
                        setImageFile(null);
                        setImagePreview(e.target.value || null);
                      }}
                      className="input-base rounded-lg text-sm flex-1" placeholder="https://..."
                      disabled={!!imageFile}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={productForm.description} rows={3}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="input-base rounded-lg" placeholder="Product description..."
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold hover:shadow-lg transition">
                {editingProduct ? '💾 Update' : '✨ Create'}
              </button>
              <button type="button" onClick={resetProductForm} className="px-6 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Price</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Stock</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-500">#{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-lg">💄</div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.stock > 10 ? 'bg-green-100 text-green-700' :
                      p.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category_name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditProduct(p)} className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id, p.name)} className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">🛍️</p>
            <p>No products yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">
          {categories.length} categories
        </h3>
        <button
          onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }}
          className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition"
        >
          + Add Category
        </button>
      </div>

      {/* Category Form */}
      {showCategoryForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">
            {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
          </h4>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input
                type="text" value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="input-base rounded-lg" placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={categoryForm.description} rows={2}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="input-base rounded-lg" placeholder="Optional description"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold hover:shadow-lg transition">
                {editingCategory ? '💾 Update' : '✨ Create'}
              </button>
              <button type="button" onClick={resetCategoryForm} className="px-6 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-800">{cat.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{cat.description || 'No description'}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#{cat.id}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEditCategory(cat)} className="flex-1 px-3 py-2 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                ✏️ Edit
              </button>
              <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="flex-1 px-3 py-2 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📂</p>
          <p>No categories yet</p>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-800">{users.length} users</h3>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Created</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-500">#{u.id}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role === 'ADMIN' ? '👑 ADMIN' : '👤 CLIENT'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {u.id === user.id ? (
                      <span className="text-xs text-gray-400 italic">You</span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">👤</p>
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );

  // ============ MAIN RENDER ============
  if (loading && !stats && activeTab === 'stats') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">🛠️ Admin Panel</h1>
          <p className="text-pink-100 mt-1">Manage your e-commerce platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-bold whitespace-nowrap transition border-b-3 ${
                activeTab === tab.id
                  ? 'border-pink-600 text-pink-600 bg-pink-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && activeTab !== 'stats' ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'users' && renderUsers()}
          </>
        )}
      </div>
    </div>
  );
}