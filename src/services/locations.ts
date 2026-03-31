import { api } from "@/services/api";
import type { AxiosError } from "axios";
import type { PaginationParams, PaginatedResult } from "@/hooks/useServerTable";

export interface Location {
    id: string;
    name: string;
    address?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationPayload {
    name: string;
    address?: string;
}

export interface UpdateLocationPayload {
    name?: string;
    address?: string;
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

export async function getLocations(params?: PaginationParams): Promise<PaginatedResult<Location>> {
    try {
        const { data } = await api.get<PaginatedResult<Location>>("/locations", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getLocationById(id: string): Promise<Location> {
    try {
        const { data } = await api.get<Location>(`/locations/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createLocation(payload: CreateLocationPayload): Promise<Location> {
    try {
        const { data } = await api.post<Location>("/locations", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateLocation(id: string, payload: UpdateLocationPayload): Promise<Location> {
    try {
        const { data } = await api.patch<Location>(`/locations/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteLocation(id: string): Promise<void> {
    try {
        await api.delete(`/locations/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
