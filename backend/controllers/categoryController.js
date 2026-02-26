const Category = require('../models/Category');
const { handleAsync } = require('../middleware/errorHandler');

// Get all categories
exports.getAllCategories = handleAsync(async (req, res) => {
  const categories = await Category.findAll();

  res.json({
    success: true,
    categories,
    count: categories.length,
  });
});

// Get category by ID
exports.getCategoryById = handleAsync(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  res.json({
    success: true,
    category,
  });
});

// Create category (ADMIN)
exports.createCategory = handleAsync(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Category name required',
    });
  }

  // Check if name exists
  if (await Category.existsByName(name)) {
    return res.status(400).json({
      success: false,
      message: 'Category name already exists',
    });
  }

  const category = await Category.create({ name, description });

  res.status(201).json({
    success: true,
    message: 'Category created',
    category,
  });
});

// Update category (ADMIN)
exports.updateCategory = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  const updated = await Category.update(id, { name, description });

  res.json({
    success: true,
    message: 'Category updated',
    category: updated,
  });
});

// Delete category (ADMIN)
exports.deleteCategory = handleAsync(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  await Category.delete(id);

  res.json({
    success: true,
    message: 'Category deleted',
  });
});

// Get subcategories by category ID
exports.getSubcategoriesByCategoryId = handleAsync(async (req, res) => {
  const { id } = req.params;
  const subcategories = await Category.findSubcategoriesByCategoryId(id);

  if (!subcategories || subcategories.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No subcategories found for this category',
    });
  }

  res.json({
    success: true,
    subcategories,
    count: subcategories.length,
  });
});