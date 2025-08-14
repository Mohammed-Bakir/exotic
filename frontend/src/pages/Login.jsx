import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiBox } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });

    const { login, register, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const result = await login({
                    email: formData.email,
                    password: formData.password
                });

                if (result.success) {
                    showSuccess(`🎉 Welcome back, ${result.user.firstName}!`);
                    navigate('/');
                } else {
                    showError(result.message);
                }
            } else {
                // Register
                if (formData.password !== formData.confirmPassword) {
                    showError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                const result = await register({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password
                });

                if (result.success) {
                    showSuccess(`🎉 Welcome to Exotic, ${result.user.firstName}!`);
                    navigate('/');
                } else {
                    showError(result.message);
                }
            }
        } catch (error) {
            showError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: ''
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '900px',
                display: 'flex'
            }}>
                {/* Left Side - Form */}
                <div style={{
                    flex: '1',
                    padding: '48px 40px',
                    minWidth: '400px'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <Link to="/" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '24px'
                        }}>
                            <FiBox />
                            Exotic
                        </Link>

                        <h1 style={{
                            fontSize: '28px',
                            marginBottom: '8px',
                            color: '#1e293b'
                        }}>
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h1>
                        <p style={{ color: '#64748b' }}>
                            {isLogin
                                ? 'Sign in to your account to continue shopping'
                                : 'Join Exotic to start exploring our 3D printed products'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: '#374151'
                                    }}>
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required={!isLogin}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: '#374151'
                                    }}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required={!isLogin}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                fontSize: '14px',
                                color: '#374151'
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    placeholder="Enter your email"
                                />
                                <FiMail style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: isLogin ? '24px' : '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                fontSize: '14px',
                                color: '#374151'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 40px 12px 40px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    placeholder="Enter your password"
                                />
                                <FiLock style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}>
                                    Confirm Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required={!isLogin}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            transition: 'border-color 0.2s'
                                        }}
                                        placeholder="Confirm your password"
                                    />
                                    <FiLock style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8'
                                    }} />
                                </div>
                            </div>
                        )}

                        {isLogin && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    color: '#64748b'
                                }}>
                                    <input
                                        type="checkbox"
                                        style={{ marginRight: '8px' }}
                                    />
                                    Remember me
                                </label>

                                <Link to="/forgot-password" style={{
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                    fontSize: '14px'
                                }}>
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                fontSize: '16px',
                                marginBottom: '24px'
                            }}
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button
                                type="button"
                                onClick={toggleMode}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>"Demo Admin Email: admin@gmail.com" </div>
                            <div style={{ color: '#64748b', fontSize: '14px' }}> "Demo Admin Password: 121212"</div>
                        </div>
                    </form>
                </div>

                {/* Right Side - Image/Info */}
                <div style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '48px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: '400px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '64px',
                            marginBottom: '24px',
                            opacity: '0.9'
                        }}>
                            <FiUser />
                        </div>

                        <h2 style={{
                            fontSize: '24px',
                            marginBottom: '16px',
                            fontWeight: '600'
                        }}>
                            {isLogin ? 'Welcome Back!' : 'Join Our Community'}
                        </h2>

                        <p style={{
                            opacity: '0.9',
                            lineHeight: '1.6',
                            marginBottom: '32px'
                        }}>
                            {isLogin
                                ? 'Access your account to view your orders, track shipments, and discover new 3D printed products.'
                                : 'Create an account to save your favorite products, track orders, and get exclusive access to new designs.'
                            }
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '24px',
                            fontSize: '14px',
                            opacity: '0.8'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', fontSize: '20px' }}>10k+</div>
                                <div>Happy Customers</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', fontSize: '20px' }}>500+</div>
                                <div>Products</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', fontSize: '20px' }}>50+</div>
                                <div>Countries</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;