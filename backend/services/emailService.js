const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Don't throw — email failure should not break orders
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (order, deliveryInfo, customerEmail) => {
  if (!deliveryInfo) return;

  const itemsHtml = order.items
    ? order.items.map(item => `<li>${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</li>`).join('')
    : '';

  const html = `
    <h1>✨ Order Confirmed!</h1>
    <p>Thank you for your order <strong>#${order.id}</strong>.</p>
    <h3>Delivery Address:</h3>
    <p>${deliveryInfo.first_name} ${deliveryInfo.last_name}<br>
    ${deliveryInfo.full_address}<br>
    ${deliveryInfo.city || ''} ${deliveryInfo.zip_code || ''}<br>
    📱 ${deliveryInfo.phone_number}</p>
    <h3>Items:</h3>
    <ul>${itemsHtml}</ul>
    <p><strong>Total: $${order.total_price?.toFixed(2) || '0.00'}</strong></p>
    <p>We will notify you when your order ships!</p>
  `;

  // Send to customer, fallback to store email
  const recipientEmail = customerEmail || process.env.MAIL_FROM || process.env.MAIL_USER;
  if (recipientEmail) {
    await sendEmail(recipientEmail, `Order #${order.id} Confirmation`, html);
  }
};

// Send order status update email
const sendOrderStatusUpdate = async (order, deliveryInfo, customerEmail) => {
  if (!deliveryInfo) return;

  const statusLabels = {
    EN_ATTENTE: 'Pending',
    CONFIRMEE: 'Confirmed',
    EXPEDIEE: 'Shipped',
    LIVREE: 'Delivered',
    ANNULEE: 'Cancelled',
  };

  const html = `
    <h1>📦 Order Update</h1>
    <p>Your order <strong>#${order.id}</strong> status has been updated to:</p>
    <h2>${statusLabels[order.status] || order.status}</h2>
    <p>Delivery to: ${deliveryInfo.first_name} ${deliveryInfo.last_name}</p>
    <p>${deliveryInfo.full_address}</p>
  `;

  // Send to customer, fallback to store email
  const recipientEmail = customerEmail || process.env.MAIL_FROM || process.env.MAIL_USER;
  if (recipientEmail) {
    await sendEmail(recipientEmail, `Order #${order.id} Status Update`, html);
  }
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};