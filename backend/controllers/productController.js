const Product = require('../models/Product');
const Category = require('../models/Category');
const { handleAsync } = require('../middleware/errorHandler');

// Get all products
exports.getAllProducts = handleAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 12;

  const products = await Product.findAll(page, limit);
  const total = await Product.count();

  res.json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Get product by ID
exports.getProductById = handleAsync(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  res.json({
    success: true,
    product,
  });
});

// Search products
exports.searchProducts = handleAsync(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 12;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query required',
    });
  }

  const products = await Product.search(q, page, limit);

  res.json({
    success: true,
    products,
    query: q,
    count: products.length,
  });
});

// Get products by category
exports.getProductsByCategory = handleAsync(async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 12;

  const products = await Product.findByCategory(categoryId, page, limit);

  res.json({
    success: true,
    products,
    count: products.length,
  });
});

// Create product (ADMIN)
exports.createProduct = handleAsync(async (req, res) => {
  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  // Verify category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category not found',
    });
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    imageUrl,
    categoryId,
  });

  res.status(201).json({
    success: true,
    message: 'Product created',
    product,
  });
});

// Update product (ADMIN)
exports.updateProduct = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found',
      });
    }
  }

  const updated = await Product.update(id, {
    name,
    description,
    price,
    stock,
    imageUrl,
    categoryId,
  });

  res.json({
    success: true,
    message: 'Product updated',
    product: updated,
  });
});

// Delete product (ADMIN)
exports.deleteProduct = handleAsync(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  await Product.delete(id);

  res.json({
    success: true,
    message: 'Product deleted',
  });
});