"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StoreUser {
    id: string;
    email: string;
    role: string;
    location?: { id: string; name: string } | null;
    emailVerified?: boolean;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: StoreUser | null;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: StoreUser | null) => void;
    login: (accessToken: string, refreshToken: string, user: StoreUser) => void;
    clearAuth: () => void;
}

export const useStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
            setUser: (user) => set({ user }),
            login: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
            clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
        }),
        {
            name: "gym-auth-store",
        },
    ),
);

/**
 * Sync cookies + localStorage from the zustand store values.
 * Called after login and after token refresh.
 */
export function syncAuthToBrowser(accessToken: string, refreshToken: string, user?: StoreUser | null) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
    if (user) {
        const json = JSON.stringify(user);
        localStorage.setItem("user", json);
        document.cookie = `user=${encodeURIComponent(json)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
}
