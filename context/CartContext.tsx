
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export interface CartItem {
    id: string; // SKU or unique identifier combining product and variant
    variantId: string;
    productId: string;
    name: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Dynamic storage key based on user ID
    const STORAGE_KEY = useMemo(() => {
        if (status === 'authenticated' && (session?.user as any)?.id) {
            return `socrati_cart_${(session.user as any).id}`;
        }
        return 'socrati_cart_guest';
    }, [session, status]);

    // Load cart from localStorage whenever the user changes (login/logout)
    // Also merges the guest cart into the user cart on sign-in
    useEffect(() => {
        if (status === 'loading') return; // wait for session to resolve

        const GUEST_KEY = 'socrati_cart_guest';
        const savedCart = localStorage.getItem(STORAGE_KEY);
        let userItems: CartItem[] = [];

        try {
            userItems = savedCart ? JSON.parse(savedCart) : [];
        } catch {
            userItems = [];
        }

        // If the user just logged in, merge guest cart into user cart
        if (status === 'authenticated') {
            const rawGuest = localStorage.getItem(GUEST_KEY);
            if (rawGuest) {
                try {
                    const guestItems: CartItem[] = JSON.parse(rawGuest);
                    if (guestItems.length > 0) {
                        // Merge: sum quantities for duplicate items, append new ones
                        const merged = [...userItems];
                        for (const guestItem of guestItems) {
                            const existing = merged.find(i => i.id === guestItem.id);
                            if (existing) {
                                existing.quantity += guestItem.quantity;
                            } else {
                                merged.push(guestItem);
                            }
                        }
                        userItems = merged;
                    }
                } catch {
                    // ignore corrupt guest cart
                }
                // Clear guest cart after merging
                localStorage.removeItem(GUEST_KEY);
            }
        }

        setCartItems(userItems);
        setIsInitialized(true);
    }, [STORAGE_KEY, status]);


    // Save to localStorage whenever cart changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized, STORAGE_KEY]);

    const addItem = useCallback((newItem: CartItem) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === newItem.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prev, newItem];
        });
        // Auto-open cart drawer when item is added
        setIsCartOpen(true);
    }, []);

    const removeItem = useCallback((id: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
