import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowRight, FiPrinter, FiBox, FiTruck } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import OrderSuccess from '../components/OrderSuccess';

// Sample data - would come from API in real app
const featuredProducts = [
    {
        _id: '1',
        title: 'Geometric Desk Organizer',
        description: 'Keep your workspace tidy with this modern geometric desk organizer. Perfect for storing pens, pencils, and small office supplies.',
        price: 24.99,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '15 x 10 x 8 cm',
        printTime: 4
    },
    {
        _id: '2',
        title: 'Honeycomb Wall Planter',
        description: 'Modern hexagonal wall planter perfect for small succulents and air plants. Comes with mounting hardware.',
        price: 19.99,
        images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PETG',
        dimensions: '12 x 12 x 5 cm',
        printTime: 3
    },
    {
        _id: '3',
        title: 'Mechanical Phone Stand',
        description: 'Articulated phone stand with adjustable viewing angles. Great for watching videos or video calls.',
        price: 15.99,
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '10 x 8 x 15 cm',
        printTime: 5
    },
    {
        _id: '4',
        title: 'Low-Poly Vase',
        description: 'Modern low-poly vase perfect for flowers or as a standalone decorative piece.',
        price: 29.99,
        images: ['https://images.unsplash.com/photo-1602748828300-2843df3b3923?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        materials: 'PLA',
        dimensions: '15 x 15 x 20 cm',
        printTime: 8
    }
];

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

            {/* Featured Products */}
            <section style={{ padding: '60px 0' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Featured Products</h2>
                        <Link to="/products" className="view-all-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>

                    <div className="products-grid">
                        {featuredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

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