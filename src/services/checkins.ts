import { api } from "@/services/api";
import type { AxiosError } from "axios";
import type { PaginationParams, PaginatedResult } from "@/hooks/useServerTable";

export interface CheckinMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}

export interface CheckinLocation {
    id: string;
    name: string;
}

export interface CheckinUser {
    id: string;
    email: string;
}

export interface Checkin {
    id: string;
    memberId: string;
    member: CheckinMember;
    locationId: string;
    location: CheckinLocation;
    checkedInBy: string | null;
    checkedInByUser: CheckinUser | null;
    checkInAt: string;
    checkOutAt: string | null;
}

export interface CreateCheckinPayload {
    memberId: string;
    locationId: string;
    checkedInBy?: string;
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

export async function getCheckins(params?: PaginationParams & { locationId?: string; dateFrom?: string; dateTo?: string }): Promise<PaginatedResult<Checkin>> {
    try {
        const { data } = await api.get<PaginatedResult<Checkin>>("/checkins", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getCheckinsByMember(memberId: string): Promise<Checkin[]> {
    try {
        const { data } = await api.get<Checkin[]>(`/checkins/member/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getTodayCheckins(params?: PaginationParams & { locationId?: string }): Promise<PaginatedResult<Checkin>> {
    try {
        const { data } = await api.get<PaginatedResult<Checkin>>("/checkins/today", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createCheckin(payload: CreateCheckinPayload): Promise<Checkin> {
    try {
        const { data } = await api.post<Checkin>("/checkins", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function checkoutCheckin(id: string): Promise<Checkin> {
    try {
        const { data } = await api.post<Checkin>(`/checkins/${id}/checkout`, {}, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}
