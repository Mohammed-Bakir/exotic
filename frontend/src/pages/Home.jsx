import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowRight, FiPrinter, FiBox, FiTruck } from 'react-icons/fi';
import OrderSuccess from '../components/OrderSuccess';

// No more mock data - homepage focuses on hero and features

const Home = () => {
    const location = useLocation();
    const { orderSuccess } = location.state || {};

    return (
        <div>
            {/* Order Success Message */}
            {orderSuccess && <OrderSuccess />}

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>3D Printed Designs for Modern Living</h1>
                    <p>Unique, customizable products crafted with precision and care</p>
                    <Link to="/products" className="btn btn-primary">
                        Shop Collection <FiArrowRight />
                    </Link>
                </div>
            </section>

            {/* Featured Products section removed - users can browse products via the main Products page */}

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiPrinter />
                            </div>
                            <h3>Design & Print</h3>
                            <p>We design and 3D print each product with precision and attention to detail</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiBox />
                            </div>
                            <h3>Quality Check</h3>
                            <p>Each item undergoes rigorous quality control before packaging</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiTruck />
                            </div>
                            <h3>Fast Shipping</h3>
                            <p>Your order is carefully packaged and shipped directly to your door</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2 className="cta-title">Ready for Custom 3D Printed Products?</h2>
                    <p className="cta-description">
                        We can bring your ideas to life with custom designs tailored to your needs
                    </p>
                    <Link to="/contact" className="btn btn-primary cta-button">
                        Request Custom Order
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;