import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Wishlist Context
const WishlistContext = createContext();

// Wishlist Actions
const WISHLIST_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    CLEAR_WISHLIST: 'CLEAR_WISHLIST',
    LOAD_WISHLIST: 'LOAD_WISHLIST'
};

// Wishlist Reducer
const wishlistReducer = (state, action) => {
    switch (action.type) {
        case WISHLIST_ACTIONS.ADD_ITEM: {
            const { product } = action.payload;

            // Check if item already exists
            const existingItemIndex = state.items.findIndex(
                item => item._id === product._id
            );

            if (existingItemIndex >= 0) {
                // Item already in wishlist, don't add duplicate
                return state;
            }

            // Add new item to wishlist
            const newItem = {
                _id: product._id,
                title: product.title,
                price: product.price,
                image: product.images?.[0] || product.image,
                description: product.description,
                materials: product.materials,
                category: product.category,
                colors: product.colors,
                rating: product.rating,
                reviews: product.reviews,
                addedAt: new Date().toISOString()
            };

            return {
                ...state,
                items: [...state.items, newItem]
            };
        }

        case WISHLIST_ACTIONS.REMOVE_ITEM: {
            return {
                ...state,
                items: state.items.filter(item => item._id !== action.payload.id)
            };
        }

        case WISHLIST_ACTIONS.CLEAR_WISHLIST: {
            return {
                ...state,
                items: []
            };
        }

        case WISHLIST_ACTIONS.LOAD_WISHLIST: {
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

// Wishlist Provider Component
export const WishlistProvider = ({ children }) => {
    const [state, dispatch] = useReducer(wishlistReducer, initialState);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('exotic-wishlist');
        if (savedWishlist) {
            try {
                const wishlistItems = JSON.parse(savedWishlist);
                dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: wishlistItems });
            } catch (error) {
                console.error('Error loading wishlist from localStorage:', error);
            }
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('exotic-wishlist', JSON.stringify(state.items));
    }, [state.items]);

    // Wishlist actions
    const addToWishlist = (product) => {
        dispatch({
            type: WISHLIST_ACTIONS.ADD_ITEM,
            payload: { product }
        });
    };

    const removeFromWishlist = (id) => {
        dispatch({
            type: WISHLIST_ACTIONS.REMOVE_ITEM,
            payload: { id }
        });
    };

    const clearWishlist = () => {
        dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
    };

    // Wishlist utilities
    const isInWishlist = (productId) => {
        return state.items.some(item => item._id === productId);
    };

    const getWishlistItemsCount = () => {
        return state.items.length;
    };

    const toggleWishlist = (product) => {
        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id);
            return false; // Removed
        } else {
            addToWishlist(product);
            return true; // Added
        }
    };

    // Get wishlist items by category
    const getWishlistByCategory = (category) => {
        if (category === 'all') return state.items;
        return state.items.filter(item => item.category === category);
    };

    // Get recently added items
    const getRecentlyAdded = (limit = 5) => {
        return [...state.items]
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .slice(0, limit);
    };

    const value = {
        // State
        wishlistItems: state.items,
        wishlistCount: getWishlistItemsCount(),

        // Actions
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        toggleWishlist,

        // Utilities
        isInWishlist,
        getWishlistItemsCount,
        getWishlistByCategory,
        getRecentlyAdded
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;