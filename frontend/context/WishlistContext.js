"use client";

import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem("wishlistItems");
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isInitialized]);


  const getProductId = (item) => item?._id || item?.product;

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => getProductId(item) === productId);

  const addToWishlist = (product) => {
    const productId = getProductId(product);
    if (!productId || isInWishlist(productId)) return;
    setWishlistItems((prev) => [...prev, { ...product, product: productId }]);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) =>
      prev.filter((item) => getProductId(item) !== productId)
    );
  };

  const toggleWishlist = (product) => {
    const productId = getProductId(product);
    if (!productId) return false;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      return false;
    }
    addToWishlist(product);
    return true;
  };

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
