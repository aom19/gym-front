import { api } from "@/services/api";
import type { AxiosError } from "axios";

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    price: string;
    durationInDays: number;
    maxEntries: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: { subscriptions: number };
}

export interface CreateSubscriptionPlanPayload {
    name: string;
    description?: string;
    price: number;
    durationInDays: number;
    maxEntries?: number;
    isActive?: boolean;
}

export interface UpdateSubscriptionPlanPayload {
    name?: string;
    description?: string;
    price?: number;
    durationInDays?: number;
    maxEntries?: number;
    isActive?: boolean;
}

function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleError(error: unknown): never {
    const axiosError = error as AxiosError<{ message?: string | string[] }>;
    const raw = axiosError.response?.data?.message ?? (error instanceof Error ? error.message : "Unexpected error");
    throw new Error(Array.isArray(raw) ? raw.join(", ") : String(raw));
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
        const { data } = await api.get<SubscriptionPlan[]>("/subscription-plans", { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    try {
        const { data } = await api.get<SubscriptionPlan>(`/subscription-plans/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createSubscriptionPlan(payload: CreateSubscriptionPlanPayload): Promise<SubscriptionPlan> {
    try {
        const { data } = await api.post<SubscriptionPlan>("/subscription-plans", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateSubscriptionPlan(id: string, payload: UpdateSubscriptionPlanPayload): Promise<SubscriptionPlan> {
    try {
        const { data } = await api.patch<SubscriptionPlan>(`/subscription-plans/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
    try {
        await api.delete(`/subscription-plans/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
