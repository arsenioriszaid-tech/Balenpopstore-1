"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // combination of productId + variantId to keep unique
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
  variant: {
    id: string;
    size_label: string;
    price_override: number | null;
  } | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, variant: any, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("balenpop_cart");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse cart items:", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("balenpop_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product: any, variant: any, quantity: number = 1) => {
    setItems((prev) => {
      const itemId = `${product.id}-${variant?.id || "base"}`;
      const existingIndex = prev.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const itemPrice = variant?.price_override !== undefined && variant?.price_override !== null
        ? Number(variant.price_override)
        : Number(product.price);

      return [
        ...prev,
        {
          id: itemId,
          product: {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
          },
          variant: variant
            ? {
                id: variant.id,
                size_label: variant.size_label,
                price_override: variant.price_override ? Number(variant.price_override) : null,
              }
            : null,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = items.reduce((sum, item) => {
    const price = item.variant?.price_override !== null && item.variant?.price_override !== undefined
      ? Number(item.variant.price_override)
      : Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
