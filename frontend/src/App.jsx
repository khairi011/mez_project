import React from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Router>
      <div>
        <header>
          <div className="logo">
            <div className="logo-circle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" stroke="var(--gold)" strokeWidth="4" fill="none" />
                <text x="50%" y="55%" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="36" fill="var(--gold)" dy=".3em">M</text>
              </svg>
            </div>
            <div className="logo-text">
              <div className="brand">Mezyena</div>
              <div className="subtitle">PARFUMERIE</div>
            </div>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Rechercher..." />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M10 2a8 8 0 105.29 14.29l4.58 4.58a1 1 0 001.42-1.42l-4.58-4.58A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
            </svg>
          </div>
          <div className="nav-icons">
            <div className="icon">
              <Link to="/account">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 00-5 5c0 2.76 2.24 5 5 5s5-2.24 5-5a5 5 0 00-5-5zm0 2a3 3 0 110 6 3 3 0 010-6zm0 8c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5zm0 2c2.67 0 8 1.34 8 3v1H4v-1c0-1.66 5.33-3 8-3z" />
                </svg>
                Mon Compte
              </Link>
            </div>
            <div className="icon">
              <Link to="/wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Liste de Souhaits<span className="badge">3</span>
              </Link>
            </div>
            <div className="icon">
              <Link to="/cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M7 4h14l-1.68 8.39a2 2 0 01-1.97 1.61H8.65l-.35 2h11.7a1 1 0 110 2H7a1 1 0 01-1-1c0-.05.01-.1.02-.15L6.1 14H4a1 1 0 01-1-1V6a1 1 0 011-1h3zm1.24 8h8.08l1.2-6H8.44l-.2 6zM10 19a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Panier
              </Link>
            </div>
          </div>
        </header>
        <Routes>
          <Route path="/account" element={<Login />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Add other routes here */}
        </Routes>
        <footer>
          {/* Footer content */}
        </footer>
      </div>
    </Router>
  );
};

export default App;