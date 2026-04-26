"use client";

import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem("cartItems");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Error loading cart from localStorage", error);
        }
        setIsInitialized(true);
    }, []);

    const getProductId = (item) => item?._id || item?.product;

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);


    const addToCart = (product, qty = 1, size = "Free Size") => {
        const productId = getProductId(product);
        if (!productId) return;

        const existItem = cartItems.find(
            (x) => x.product === productId && x.size === size
        );

        const payload = {
            ...product,
            product: productId,
            qty: Math.max(1, Number(qty) || 1),
            size,
        };

        if (existItem) {
            setCartItems(
                cartItems.map((x) =>
                    x.product === productId && x.size === size ? payload : x
                )
            );
        } else {
            setCartItems([...cartItems, payload]);
        }
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter(x => x.product !== id));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
