-- Database schema for Mezyena E-Commerce
CREATE DATABASE IF NOT EXISTS mezyena_db;
USE mezyena_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CLIENT', 'ADMIN') DEFAULT 'CLIENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('EN_ATTENTE', 'CONFIRMEE', 'EXPEDIEE', 'LIVREE', 'ANNULEE') DEFAULT 'EN_ATTENTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Delivery info table
CREATE TABLE IF NOT EXISTS delivery_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  full_address VARCHAR(200) NOT NULL,
  city VARCHAR(100),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Sample data: categories
INSERT IGNORE INTO categories (name, description) VALUES
('Skincare', 'Products for skin care and treatment'),
('Makeup', 'Cosmetic makeup products'),
('Fragrance', 'Perfumes and fragrances'),
('Hair Care', 'Products for hair treatment and styling'),
('Body Care', 'Body lotions, scrubs and treatments');

-- Sample data: products
INSERT IGNORE INTO products (name, description, price, stock, category_id) VALUES
('Hydrating Face Cream', 'Deep moisturizing cream for all skin types', 29.99, 50, 1),
('Vitamin C Serum', 'Brightening serum with 20% Vitamin C', 45.00, 30, 1),
('Matte Lipstick Rouge', 'Long-lasting matte lipstick in classic red', 18.50, 100, 2),
('Foundation Natural Glow', 'Lightweight foundation for a natural look', 35.00, 75, 2),
('Rose Eau de Parfum', 'Elegant rose fragrance for women', 89.99, 25, 3),
('Argan Oil Shampoo', 'Nourishing shampoo with argan oil', 22.00, 60, 4),
('Body Butter Vanilla', 'Rich body butter with vanilla scent', 24.99, 40, 5),
('Eye Shadow Palette', 'Professional 12-color eye shadow palette', 42.00, 55, 2),
('Anti-Aging Night Cream', 'Premium night cream with retinol', 55.00, 35, 1),
('Coconut Hair Mask', 'Deep conditioning hair mask', 19.99, 45, 4);
