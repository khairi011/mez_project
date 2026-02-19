const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { handleAsync } = require('../middleware/errorHandler');

// Get user's cart
exports.getCart = handleAsync(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOrCreate(userId);
  const items = await CartItem.findByCartId(cart.id);
  const total = await Cart.getTotal(cart.id);

  res.json({
    success: true,
    cart: {
      id: cart.id,
      items,
      total,
      itemCount: items.length,
    },
  });
});

// Add to cart
exports.addToCart = handleAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  // Get or create cart
  const cart = await Cart.findOrCreate(userId);

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check stock
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock',
    });
  }

  // Check if already in cart
  let cartItem = await CartItem.findByCartAndProduct(cart.id, productId);

  if (cartItem) {
    // Update quantity
    const newQuantity = cartItem.quantity + quantity;
    if (product.stock < newQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }
    cartItem = await CartItem.update(cartItem.id, newQuantity);
  } else {
    // Create new item
    cartItem = await CartItem.create(cart.id, productId, quantity);
  }

  res.status(201).json({
    success: true,
    message: 'Added to cart',
    cartItem,
  });
});

// Update cart item
exports.updateCartItem = handleAsync(async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1',
    });
  }

  const cartItem = await CartItem.findById(cartItemId);
  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found',
    });
  }

  // Check stock
  const product = await Product.findById(cartItem.product_id);
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock',
    });
  }

  const updated = await CartItem.update(cartItemId, quantity);

  res.json({
    success: true,
    message: 'Cart item updated',
    cartItem: updated,
  });
});

// Remove from cart
exports.removeFromCart = handleAsync(async (req, res) => {
  const { cartItemId } = req.params;

  const cartItem = await CartItem.findById(cartItemId);
  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found',
    });
  }

  await CartItem.delete(cartItemId);

  res.json({
    success: true,
    message: 'Item removed from cart',
  });
});

// Clear cart
exports.clearCart = handleAsync(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findByUserId(userId);
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }

  await Cart.clear(cart.id);

  res.json({
    success: true,
    message: 'Cart cleared',
  });
});