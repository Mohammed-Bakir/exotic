import React from 'react';
import { FiPrinter, FiUsers, FiAward, FiHeart } from 'react-icons/fi';

const About = () => {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '80px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', marginBottom: '24px' }}>About Exotic</h1>
                    <p style={{ fontSize: '20px', opacity: '0.9' }}>
                        We're passionate about bringing innovative 3D printed designs to life,
                        creating unique products that blend functionality with modern aesthetics.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section style={{ padding: '80px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center' }}>
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <h2 style={{ fontSize: '36px', marginBottom: '24px' }}>Our Story</h2>
                            <p style={{ marginBottom: '20px', lineHeight: '1.7', fontSize: '16px' }}>
                                Founded in 2020, Exotic began as a small workshop with a big vision: to make high-quality
                                3D printed products accessible to everyone. What started as a passion project has grown
                                into a thriving business that serves customers worldwide.
                            </p>
                            <p style={{ marginBottom: '20px', lineHeight: '1.7', fontSize: '16px' }}>
                                We believe that 3D printing represents the future of manufacturing - sustainable,
                                customizable, and incredibly versatile. Every product we create is designed with
                                both form and function in mind, ensuring that our customers receive items that are
                                not only beautiful but also practical.
                            </p>
                            <p style={{ lineHeight: '1.7', fontSize: '16px' }}>
                                Our team of designers and engineers work tirelessly to push the boundaries of what's
                                possible with 3D printing technology, constantly innovating and improving our processes
                                to deliver the best possible products.
                            </p>
                        </div>

                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <img
                                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                                alt="3D Printing Workshop"
                                style={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: '80px 20px', backgroundColor: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '60px' }}>Our Values</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '40px'
                    }}>
                        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <div style={{
                                fontSize: '48px',
                                color: '#2563eb',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <FiPrinter />
                            </div>
                            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Innovation</h3>
                            <p style={{ lineHeight: '1.6', color: '#64748b' }}>
                                We constantly explore new materials, techniques, and designs to stay at the
                                forefront of 3D printing technology.
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <div style={{
                                fontSize: '48px',
                                color: '#2563eb',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <FiAward />
                            </div>
                            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Quality</h3>
                            <p style={{ lineHeight: '1.6', color: '#64748b' }}>
                                Every product undergoes rigorous quality control to ensure it meets our
                                high standards before reaching your hands.
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <div style={{
                                fontSize: '48px',
                                color: '#2563eb',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <FiHeart />
                            </div>
                            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Sustainability</h3>
                            <p style={{ lineHeight: '1.6', color: '#64748b' }}>
                                We use eco-friendly materials and minimize waste through precise
                                manufacturing and on-demand production.
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <div style={{
                                fontSize: '48px',
                                color: '#2563eb',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <FiUsers />
                            </div>
                            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Community</h3>
                            <p style={{ lineHeight: '1.6', color: '#64748b' }}>
                                We believe in building strong relationships with our customers and
                                supporting the maker community worldwide.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{
                padding: '80px 20px',
                backgroundColor: '#1e293b',
                color: 'white'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '40px',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>10,000+</div>
                            <div style={{ opacity: '0.8' }}>Products Printed</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>5,000+</div>
                            <div style={{ opacity: '0.8' }}>Happy Customers</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>50+</div>
                            <div style={{ opacity: '0.8' }}>Countries Served</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>99%</div>
                            <div style={{ opacity: '0.8' }}>Customer Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;