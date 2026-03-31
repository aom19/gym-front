import { api } from "@/services/api";
import type { AxiosError } from "axios";
import type { PaginationParams, PaginatedResult } from "@/hooks/useServerTable";

export interface UserRole {
    id: string;
    name: string;
}

export interface UserLocation {
    id: string;
    name: string;
}

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    role: UserRole;
    location: UserLocation;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserPayload {
    email: string;
    password: string;
    roleId: string;
    locationId: string;
}

export interface UpdateUserPayload {
    email?: string;
    password?: string;
    roleId?: string;
    locationId?: string;
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

export async function getUsers(params?: PaginationParams): Promise<PaginatedResult<User>> {
    try {
        const { data } = await api.get<PaginatedResult<User>>("/users", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getUserById(id: string): Promise<User> {
    try {
        const { data } = await api.get<User>(`/users/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
    try {
        const { data } = await api.post<User>("/users", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    try {
        const { data } = await api.patch<User>(`/users/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteUser(id: string): Promise<void> {
    try {
        await api.delete(`/users/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}

export async function getRoles(): Promise<UserRole[]> {
    try {
        const { data } = await api.get<{ data: UserRole[] }>("/roles", { headers: getAuthHeaders(), params: { limit: 0 } });
        return data.data;
    } catch {
        return [];
    }
}

export async function getLocations(): Promise<UserLocation[]> {
    try {
        const { data } = await api.get<{ data: UserLocation[] }>("/locations", { headers: getAuthHeaders(), params: { limit: 0 } });
        return data.data;
    } catch {
        return [];
    }
}
