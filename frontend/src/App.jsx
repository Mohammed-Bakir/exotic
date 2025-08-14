import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './config/stripe';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { PaymentProvider } from './context/PaymentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetailPage from './pages/OrderDetailPage';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import MakeAdmin from './components/MakeAdmin';
import UserDebug from './components/UserDebug';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
// import TestIntegrations from './pages/TestIntegrations';
import './App.css';

function App() {
  return (
    <Elements stripe={stripePromise}>
      <AuthProvider>
        <ToastProvider>
          <PaymentProvider>
            <CartProvider>
              <WishlistProvider>
                <Router>
                  <div className="app">
                    <Header />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/make-admin" element={<MakeAdmin />} />
                        <Route path="/debug" element={<UserDebug />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        {/* <Route path="/test" element={<TestIntegrations />} /> */}
                      </Routes>
                    </main>
                    <Footer />
                    <ToastContainer />
                  </div>
                </Router>
              </WishlistProvider>
            </CartProvider>
          </PaymentProvider>
        </ToastProvider>
      </AuthProvider>
    </Elements>
  );
}

export default App;
