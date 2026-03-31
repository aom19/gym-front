import { api } from "@/services/api";
import type { AxiosError } from "axios";
import type { PaginationParams, PaginatedResult } from "@/hooks/useServerTable";

export interface MemberLocation {
    id: string;
    name: string;
}

export interface ActiveSubscription {
    id: string;
    status: string;
    endDate: string;
    entriesLeft: number | null;
    plan: { name: string };
}

export interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    dateOfBirth: string | null;
    userId: string | null;
    location: MemberLocation;
    createdAt: string;
    updatedAt: string;
    subscriptions?: ActiveSubscription[];
}

export interface CreateMemberPayload {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    locationId: string;
    userId?: string;
}

export interface UpdateMemberPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    locationId?: string;
    userId?: string;
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

export async function getMembers(params?: PaginationParams): Promise<PaginatedResult<Member>> {
    try {
        const { data } = await api.get<PaginatedResult<Member>>("/members", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getMemberById(id: string): Promise<Member> {
    try {
        const { data } = await api.get<Member>(`/members/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createMember(payload: CreateMemberPayload): Promise<Member> {
    try {
        const { data } = await api.post<Member>("/members", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateMember(id: string, payload: UpdateMemberPayload): Promise<Member> {
    try {
        const { data } = await api.patch<Member>(`/members/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteMember(id: string): Promise<void> {
    try {
        await api.delete(`/members/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
