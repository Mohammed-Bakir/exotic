import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { user, isAuthenticated, logout } = useAuth();
    const { showSuccess } = useToast();
    const navigate = useNavigate();

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        showSuccess('👋 Logged out successfully!');
        navigate('/'); // Redirect to home page
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    Exotic
                </Link>

                <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <ul className="nav-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <Link to="/wishlist" className="cart-button">
                        <FiHeart />
                        {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
                    </Link>

                    <Link to="/cart" className="cart-button">
                        <FiShoppingCart />
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <div className="user-menu" ref={userMenuRef}>
                            <button
                                className="btn btn-secondary user-menu-button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <FiUser /> {user?.firstName}
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="user-info">
                                        <p className="user-name">{user?.firstName} {user?.lastName}</p>
                                        <p className="user-email">{user?.email}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        <FiUser /> Profile
                                    </Link>
                                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        📦 Orders
                                    </Link>
                                    <Link to="/wishlist" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        💖 Wishlist
                                    </Link>
                                    <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        ⚙️ Admin Panel
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-secondary">
                            <FiUser /> Account
                        </Link>
                    )}

                    <button
                        className="mobile-menu-button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;