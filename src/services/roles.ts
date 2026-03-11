import { api } from "@/services/api";
import type { AxiosError } from "axios";

export interface Role {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { users: number };
}

export interface RoleWithPermissions extends Role {
    rolePermissions: Array<{
        id: string;
        permission: { id: string; entity: string; action: string };
    }>;
}

export interface CreateRolePayload {
    name: string;
    description?: string;
}

export interface UpdateRolePayload {
    name?: string;
    description?: string;
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

export async function getRoles(): Promise<Role[]> {
    try {
        const { data } = await api.get<Role[]>("/roles", { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getRoleById(id: string): Promise<RoleWithPermissions> {
    try {
        const { data } = await api.get<RoleWithPermissions>(`/roles/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
    try {
        const { data } = await api.post<Role>("/roles", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
    try {
        const { data } = await api.patch<Role>(`/roles/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteRole(id: string): Promise<void> {
    try {
        await api.delete(`/roles/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
