import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <Link to="/" className="logo" style={{ color: 'white', marginBottom: '16px' }}>
                        Exotic
                    </Link>
                    <p>Premium 3D printed products for your unique needs. Quality craftsmanship with innovative designs.</p>
                    <div className="social-icons" style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FiTwitter /></a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FiYoutube /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Shop</h3>
                    <Link to="/products">All Products</Link>
                    <Link to="/products/category/home-decor">Home Decor</Link>
                    <Link to="/products/category/gadgets">Gadgets</Link>
                    <Link to="/products/category/accessories">Accessories</Link>
                    <Link to="/products/category/custom">Custom Orders</Link>
                </div>

                <div className="footer-section">
                    <h3>Customer Service</h3>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/shipping">Shipping & Returns</Link>
                    <Link to="/warranty">Warranty</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>

                <div className="footer-section">
                    <h3>Newsletter</h3>
                    <p>Subscribe to get special offers, free giveaways, and new product announcements.</p>
                    <div className="newsletter-form" style={{ marginTop: '16px' }}>
                        <input
                            type="email"
                            placeholder="Your email address"
                            style={{
                                padding: '10px',
                                borderRadius: '4px',
                                border: 'none',
                                width: '100%',
                                marginBottom: '8px'
                            }}
                        />
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Exotic. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;