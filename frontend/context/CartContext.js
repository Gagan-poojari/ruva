"use client";

import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, qty, size) => {
        const existItem = cartItems.find(x => x.product === product._id);
        
        if (existItem) {
            setCartItems(cartItems.map(x => 
                x.product === existItem.product ? { ...product, product: product._id, qty, size } : x
            ));
        } else {
            setCartItems([...cartItems, { ...product, product: product._id, qty, size }]);
        }
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter(x => x.product !== id));
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
