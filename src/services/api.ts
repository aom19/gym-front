import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request interceptor: inject Authorization header ───────────────────────
api.interceptors.request.use((config) => {
    if (typeof window === "undefined") return config;
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response interceptor: auto-refresh on 401 ─────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
        const { data } = await axios.post<{
            accessToken: string;
            refreshToken: string;
            user?: Record<string, unknown>;
        }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
        if (data.user) {
            const userJson = JSON.stringify(data.user);
            localStorage.setItem("user", userJson);
            document.cookie = `user=${encodeURIComponent(userJson)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        return data.accessToken;
    } catch {
        return null;
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (
            typeof window === "undefined" ||
            error.response?.status !== 401 ||
            original._retry ||
            original.url?.includes("/auth/")
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        // Deduplicate concurrent refresh attempts
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (!newToken) {
            // Refresh failed — clear auth & redirect
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
            document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
            const locale = window.location.pathname.split("/")[1] || "ro";
            window.location.href = `/${locale}/login`;
            return Promise.reject(error);
        }

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
    },
);
