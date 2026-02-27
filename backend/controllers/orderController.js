const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const DeliveryInfo = require('../models/DeliveryInfo');
const Product = require('../models/Product');
const emailService = require('../services/emailService');
const { handleAsync } = require('../middleware/errorHandler');

// Create order with delivery info ⭐ CRITICAL
exports.createOrder = handleAsync(async (req, res) => {
  const userId = req.user?.id;
  const { cartId, deliveryInfo } = req.body;

  // Get cart
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }

  // Verify user owns cart if authenticated
  if (userId && cart.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  // Get cart items
  const cartItems = await CartItem.findByCartId(cartId);
  if (cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty',
    });
  }

  // Validate delivery info
  const deliveryErrors = DeliveryInfo.validate(deliveryInfo);
  if (deliveryErrors) {
    return res.status(400).json({
      success: false,
      message: 'Delivery info validation failed',
      errors: deliveryErrors,
    });
  }

  // Calculate total and verify stock
  let totalPrice = 0;
  for (const item of cartItems) {
    const product = await Product.findById(item.product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${item.product_id} not found`,
      });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}`,
      });
    }
    totalPrice += product.price * item.quantity;
  }

  try {
    // Create order
    const orderId = await Order.create({
      userId: userId || null,
      totalPrice,
      status: 'EN_ATTENTE',
    });

    // Create delivery info ⭐
    await DeliveryInfo.create({
      orderId,
      ...deliveryInfo,
    });

    // Create order items
    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);
      await OrderItem.create(orderId, item.product_id, item.quantity, product.price);
    }

    // Update product stock
    for (const item of cartItems) {
      await Product.updateStock(item.product_id, -item.quantity);
    }

    // Clear cart
    await Cart.clear(cartId);

    // Get created order with details
    const order = await Order.findByIdWithDetails(orderId);

    // Send confirmation email to the customer
    if (order.deliveryInfo) {
      const userEmail = req.user?.email;
      await emailService.sendOrderConfirmation(order, order.deliveryInfo, userEmail);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    // Cleanup on error
    await Order.delete(orderId);
    throw error;
  }
});

// Get user's orders
exports.getMyOrders = handleAsync(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const orders = await Order.findByUserId(userId, page, limit);

  res.json({
    success: true,
    orders,
    count: orders.length,
  });
});

// Get order by ID
exports.getOrderById = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const order = await Order.findByIdWithDetails(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Verify user owns this order (if authenticated)
  if (userId && order.user_id && order.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  res.json({
    success: true,
    order,
  });
});

// Cancel order
exports.cancelOrder = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findByIdWithDetails(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Verify user owns this order
  if (order.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  // Can only cancel certain statuses
  if (!['EN_ATTENTE', 'CONFIRMEE'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel order in this status',
    });
  }

  // Restore stock
  for (const item of order.items) {
    await Product.updateStock(item.product_id, item.quantity);
  }

  // Update status
  await Order.updateStatus(id, 'ANNULEE');

  res.json({
    success: true,
    message: 'Order cancelled',
  });
});