import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useToast } from './ToastContext';

const PaymentContext = createContext();

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};

export const PaymentProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [paymentIntent, setPaymentIntent] = useState(null);
    const { showToast } = useToast();

    // Create payment intent
    const createPaymentIntent = async (orderId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('exotic-token');

            const response = await axios.post(
                `${API_BASE_URL}/api/payments/create-intent`,
                { orderId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setPaymentIntent({
                    clientSecret: response.data.clientSecret,
                    paymentIntentId: response.data.paymentIntentId
                });
                return response.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Create payment intent error:', error);
            showToast(error.response?.data?.message || 'Failed to create payment intent', 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Confirm payment
    const confirmPayment = async (paymentIntentId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('exotic-token');

            const response = await axios.post(
                `${API_BASE_URL}/api/payments/confirm`,
                { paymentIntentId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                showToast('Payment confirmed successfully!', 'success');
                return response.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Confirm payment error:', error);
            showToast(error.response?.data?.message || 'Payment confirmation failed', 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Reset payment state
    const resetPayment = () => {
        setPaymentIntent(null);
    };

    const value = {
        loading,
        paymentIntent,
        createPaymentIntent,
        confirmPayment,
        resetPayment
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};