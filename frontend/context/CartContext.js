"use client";

import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window === "undefined") return [];
        try {
            const storedCart = localStorage.getItem("cartItems");
            return storedCart ? JSON.parse(storedCart) : [];
        } catch {
            return [];
        }
    });
    const getProductId = (item) => item?._id || item?.product;

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

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

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
