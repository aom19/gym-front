import { api } from "@/services/api";
import type { AxiosError } from "axios";

export interface SubscriptionMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}

export interface SubscriptionPlanInfo {
    id: string;
    name: string;
    price: string;
    durationInDays: number;
    maxEntries: number | null;
}

export interface Subscription {
    id: string;
    memberId: string;
    member: SubscriptionMember;
    planId: string;
    plan: SubscriptionPlanInfo;
    startDate: string;
    endDate: string;
    entriesLeft: number | null;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionStatus {
    member: { id: string; firstName: string; lastName: string };
    hasActiveSubscription: boolean;
    subscription: Subscription | null;
    daysRemaining: number;
    entriesRemaining: number | null;
}

export interface CreateSubscriptionPayload {
    memberId: string;
    planId: string;
    startDate?: string;
    entriesLeft?: number;
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

export async function getSubscriptionsByMember(memberId: string): Promise<Subscription[]> {
    try {
        const { data } = await api.get<Subscription[]>(`/subscriptions/member/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getSubscriptionStatus(memberId: string): Promise<SubscriptionStatus> {
    try {
        const { data } = await api.get<SubscriptionStatus>(`/subscriptions/status/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createSubscription(payload: CreateSubscriptionPayload): Promise<Subscription> {
    try {
        const { data } = await api.post<Subscription>("/subscriptions", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function cancelSubscription(id: string): Promise<Subscription> {
    try {
        const { data } = await api.patch<Subscription>(`/subscriptions/${id}/cancel`, {}, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}
