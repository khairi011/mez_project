// backend/models/DeliveryInfo.js

const pool = require('../config/database');

class DeliveryInfo {
  // Create delivery info
  static async create(deliveryData) {
    const {
      orderId,
      firstName,
      lastName,
      phoneNumber,
      fullAddress,
      city,
      zipCode,
    } = deliveryData;

    // Clean data
    const cleanedPhoneNumber = phoneNumber.replace(/\s/g, '');
    const cleanedFirstName = firstName.trim();
    const cleanedLastName = lastName.trim();
    const cleanedAddress = fullAddress.trim();
    const cleanedCity = city ? city.trim() : null;

    const query = `
      INSERT INTO delivery_info 
      (order_id, first_name, last_name, phone_number, full_address, city, zip_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await pool.execute(query, [
        orderId,
        cleanedFirstName,
        cleanedLastName,
        cleanedPhoneNumber,
        cleanedAddress,
        cleanedCity,
        zipCode || null,
      ]);

      return this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Delivery info already exists for this order');
      }
      throw error;
    }
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT 
        id, order_id, first_name, last_name, phone_number, 
        full_address, city, zip_code, created_at
      FROM delivery_info
      WHERE id = ?
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Find by order ID
  static async findByOrderId(orderId) {
    const query = `
      SELECT 
        id, order_id, first_name, last_name, phone_number, 
        full_address, city, zip_code, created_at
      FROM delivery_info
      WHERE order_id = ?
    `;

    const [rows] = await pool.execute(query, [orderId]);
    return rows[0] || null;
  }

  // Update delivery info
  static async update(id, deliveryData) {
    const {
      firstName,
      lastName,
      phoneNumber,
      fullAddress,
      city,
      zipCode,
    } = deliveryData;

    const cleanedPhoneNumber = phoneNumber.replace(/\s/g, '');

    const query = `
      UPDATE delivery_info
      SET 
        first_name = ?,
        last_name = ?,
        phone_number = ?,
        full_address = ?,
        city = ?,
        zip_code = ?
      WHERE id = ?
    `;

    await pool.execute(query, [
      firstName.trim(),
      lastName.trim(),
      cleanedPhoneNumber,
      fullAddress.trim(),
      city ? city.trim() : null,
      zipCode || null,
      id,
    ]);

    return this.findById(id);
  }

  // Delete delivery info
  static async delete(id) {
    const query = 'DELETE FROM delivery_info WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Delete by order ID
  static async deleteByOrderId(orderId) {
    const query = 'DELETE FROM delivery_info WHERE order_id = ?';
    const [result] = await pool.execute(query, [orderId]);
    return result.affectedRows > 0;
  }

  // Check if exists for order
  static async existsByOrderId(orderId) {
    const query = 'SELECT id FROM delivery_info WHERE order_id = ?';
    const [rows] = await pool.execute(query, [orderId]);
    return rows.length > 0;
  }

  // Format for display
  static formatForDisplay(deliveryInfo) {
    if (!deliveryInfo) return null;

    return {
      id: deliveryInfo.id,
      orderId: deliveryInfo.order_id,
      fullName: `${deliveryInfo.first_name} ${deliveryInfo.last_name}`,
      firstName: deliveryInfo.first_name,
      lastName: deliveryInfo.last_name,
      phoneNumber: this.formatPhoneNumber(deliveryInfo.phone_number),
      fullAddress: deliveryInfo.full_address,
      city: deliveryInfo.city,
      zipCode: deliveryInfo.zip_code,
      createdAt: deliveryInfo.created_at,
    };
  }

  // Format phone number for display
  static formatPhoneNumber(phone) {
    if (!phone) return '';
    // Format +33612345678 to +33 6 12 34 56 78
    if (phone.startsWith('+33')) {
      return `+33 ${phone.slice(3, 4)} ${phone.slice(4, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)} ${phone.slice(10)}`;
    }
    // Format 0612345678 to 06 12 34 56 78
    return `${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
  }

  // Validate delivery data
  static validate(deliveryData) {
    const errors = {};

    // Validate firstName
    if (!deliveryData.firstName || deliveryData.firstName.trim() === '') {
      errors.firstName = 'First name required';
    } else if (deliveryData.firstName.length < 2 || deliveryData.firstName.length > 50) {
      errors.firstName = 'First name must be 2-50 characters';
    }

    // Validate lastName
    if (!deliveryData.lastName || deliveryData.lastName.trim() === '') {
      errors.lastName = 'Last name required';
    } else if (deliveryData.lastName.length < 2 || deliveryData.lastName.length > 50) {
      errors.lastName = 'Last name must be 2-50 characters';
    }

    // Validate phoneNumber
    if (!deliveryData.phoneNumber || deliveryData.phoneNumber.trim() === '') {
      errors.phoneNumber = 'Phone number required';
    } else {
      const phoneRegex = /^(?:\+33|0)[1-9]\d{8}$/;
      const cleanPhone = deliveryData.phoneNumber.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phoneNumber = 'Invalid phone number (ex: +33612345678)';
      }
    }

    // Validate fullAddress
    if (!deliveryData.fullAddress || deliveryData.fullAddress.trim() === '') {
      errors.fullAddress = 'Address required';
    } else if (deliveryData.fullAddress.length < 10 || deliveryData.fullAddress.length > 200) {
      errors.fullAddress = 'Address must be 10-200 characters';
    }

    // Validate city (optional)
    if (deliveryData.city && deliveryData.city.length < 2) {
      errors.city = 'City must have at least 2 characters';
    }

    // Validate zipCode (optional)
    if (deliveryData.zipCode && !/^\d{5}$/.test(deliveryData.zipCode)) {
      errors.zipCode = 'Zip code must be 5 digits';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

module.exports = DeliveryInfo;
