import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case CART_ACTIONS.ADD_ITEM: {
            const { product, quantity = 1, selectedColor } = action.payload;
            const existingItemIndex = state.items.findIndex(
                item => item._id === product._id && item.selectedColor === selectedColor
            );

            if (existingItemIndex >= 0) {
                // Item already exists, update quantity
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex].quantity += quantity;
                return {
                    ...state,
                    items: updatedItems
                };
            } else {
                // New item, add to cart
                const newItem = {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    image: product.images[0],
                    quantity,
                    selectedColor: selectedColor || 'Default'
                };
                return {
                    ...state,
                    items: [...state.items, newItem]
                };
            }
        }

        case CART_ACTIONS.REMOVE_ITEM: {
            return {
                ...state,
                items: state.items.filter(item =>
                    !(item._id === action.payload.id && item.selectedColor === action.payload.selectedColor)
                )
            };
        }

        case CART_ACTIONS.UPDATE_QUANTITY: {
            const { id, selectedColor, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter(item =>
                        !(item._id === id && item.selectedColor === selectedColor)
                    )
                };
            }

            return {
                ...state,
                items: state.items.map(item =>
                    item._id === id && item.selectedColor === selectedColor
                        ? { ...item, quantity }
                        : item
                )
            };
        }

        case CART_ACTIONS.CLEAR_CART: {
            return {
                ...state,
                items: []
            };
        }

        case CART_ACTIONS.LOAD_CART: {
            return {
                ...state,
                items: action.payload
            };
        }

        default:
            return state;
    }
};

// Initial state
const initialState = {
    items: []
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('exotic-cart');
        if (savedCart) {
            try {
                const cartItems = JSON.parse(savedCart);
                dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartItems });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('exotic-cart', JSON.stringify(state.items));
    }, [state.items]);

    // Cart actions
    const addToCart = (product, quantity = 1, selectedColor = 'Default') => {
        dispatch({
            type: CART_ACTIONS.ADD_ITEM,
            payload: { product, quantity, selectedColor }
        });
    };

    const removeFromCart = (id, selectedColor = 'Default') => {
        dispatch({
            type: CART_ACTIONS.REMOVE_ITEM,
            payload: { id, selectedColor }
        });
    };

    const updateQuantity = (id, quantity, selectedColor = 'Default') => {
        dispatch({
            type: CART_ACTIONS.UPDATE_QUANTITY,
            payload: { id, quantity, selectedColor }
        });
    };

    const clearCart = () => {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
    };

    // Cart calculations
    const getCartTotal = () => {
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getShippingCost = () => {
        const subtotal = getCartTotal();
        return subtotal > 50 ? 0 : 5.99;
    };

    const getTax = () => {
        return getCartTotal() * 0.08; // 8% tax
    };

    const getFinalTotal = () => {
        return getCartTotal() + getShippingCost() + getTax();
    };

    // Check if item is in cart
    const isInCart = (productId, selectedColor = 'Default') => {
        return state.items.some(item => item._id === productId && item.selectedColor === selectedColor);
    };

    // Get item quantity in cart
    const getItemQuantity = (productId, selectedColor = 'Default') => {
        const item = state.items.find(item => item._id === productId && item.selectedColor === selectedColor);
        return item ? item.quantity : 0;
    };

    const value = {
        // State
        cartItems: state.items,
        cartCount: getCartItemsCount(),

        // Actions
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        // Calculations
        getCartTotal,
        getCartItemsCount,
        getShippingCost,
        getTax,
        getFinalTotal,

        // Utilities
        isInCart,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;