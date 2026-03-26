import { api } from "@/services/api";
import type { AxiosError } from "axios";

export interface PaymentMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}

export interface PaymentSubscription {
    id: string;
    plan: { id: string; name: string };
    startDate: string;
    endDate: string;
}

export interface Payment {
    id: string;
    memberId: string;
    member: PaymentMember;
    subscriptionId: string;
    subscription: PaymentSubscription;
    amount: string;
    currency: string;
    method: "CASH" | "CARD" | "TRANSFER";
    status: "PENDING" | "PAID" | "REFUNDED";
    notes: string | null;
    paidAt: string;
}

export interface CreatePaymentPayload {
    memberId: string;
    subscriptionId: string;
    amount: number;
    currency?: string;
    method?: "CASH" | "CARD" | "TRANSFER";
    status?: "PENDING" | "PAID" | "REFUNDED";
    notes?: string;
}

export interface UpdatePaymentPayload {
    status?: "PENDING" | "PAID" | "REFUNDED";
    notes?: string;
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

export async function getPayments(): Promise<Payment[]> {
    try {
        const { data } = await api.get<Payment[]>("/payments", { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getPaymentsByMember(memberId: string): Promise<Payment[]> {
    try {
        const { data } = await api.get<Payment[]>(`/payments/member/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
    try {
        const { data } = await api.post<Payment>("/payments", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updatePayment(id: string, payload: UpdatePaymentPayload): Promise<Payment> {
    try {
        const { data } = await api.patch<Payment>(`/payments/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deletePayment(id: string): Promise<void> {
    try {
        await api.delete(`/payments/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
