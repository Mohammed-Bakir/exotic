import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We\'ll get back to you soon.');

        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            inquiryType: 'general'
        });
    };

    return (
        <div>
            {/* Header */}
            <section style={{
                background: '#f1f5f9',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Get in Touch</h1>
                    <p style={{ fontSize: '18px', color: '#64748b' }}>
                        Have a question about our products or need a custom design? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
                    {/* Contact Information */}
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <h2 style={{ fontSize: '28px', marginBottom: '32px' }}>Contact Information</h2>

                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#2563eb',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginRight: '16px'
                                }}>
                                    <FiMail />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Email</h3>
                                    <p style={{ color: '#64748b' }}>hello@exotic3d.com</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#2563eb',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginRight: '16px'
                                }}>
                                    <FiPhone />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Phone</h3>
                                    <p style={{ color: '#64748b' }}>+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#2563eb',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginRight: '16px'
                                }}>
                                    <FiMapPin />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Address</h3>
                                    <p style={{ color: '#64748b' }}>
                                        123 Innovation Drive<br />
                                        Tech City, TC 12345<br />
                                        United States
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#2563eb',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginRight: '16px'
                                }}>
                                    <FiClock />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Business Hours</h3>
                                    <p style={{ color: '#64748b' }}>
                                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                                        Saturday: 10:00 AM - 4:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{ flex: '1', minWidth: '400px' }}>
                        <h2 style={{ fontSize: '28px', marginBottom: '32px' }}>Send us a Message</h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    Inquiry Type
                                </label>
                                <select
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="custom">Custom Design Request</option>
                                    <option value="support">Customer Support</option>
                                    <option value="wholesale">Wholesale Inquiry</option>
                                    <option value="partnership">Partnership</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows="6"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Tell us about your project or question..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FiSend /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;