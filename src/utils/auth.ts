export interface AuthLocation {
    id: string;
    name: string;
}

export interface AuthUser {
    id: string;
    email: string;
    role: string;
    location?: AuthLocation | null;
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

function parseCookieValue(name: string): string | null {
    if (typeof document === "undefined") {
        return null;
    }

    const cookie = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

export async function getAccessToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        const { cookies } = await import("next/headers");
        const store = await cookies();
        return store.get("accessToken")?.value ?? null;
    }

    const cookieToken = parseCookieValue("accessToken");
    if (cookieToken) {
        return cookieToken;
    }

    return localStorage.getItem("accessToken");
}

export async function getUser(): Promise<AuthUser | null> {
    if (typeof window === "undefined") {
        const { cookies } = await import("next/headers");
        const store = await cookies();
        const raw = store.get("user")?.value;

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(decodeURIComponent(raw)) as AuthUser;
        } catch {
            return null;
        }
    }

    const cookieUser = parseCookieValue("user");
    if (cookieUser) {
        try {
            return JSON.parse(cookieUser) as AuthUser;
        } catch {
            return null;
        }
    }

    const raw = localStorage.getItem("user");
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export async function logout(): Promise<void> {
    if (typeof window !== "undefined") {
        // Revoke the refresh token server-side so the session is invalidated.
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            try {
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken }),
                    },
                );
            } catch {
                // noop — still clear local state even if the request fails
            }
        }

        // Clear cookies set on login.
        document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "user=; path=/; max-age=0; SameSite=Lax";

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Clear zustand store
        try {
            const { useStore } = await import("@/store/useStore");
            useStore.getState().clearAuth();
        } catch { /* SSR safety */ }
    }
}
