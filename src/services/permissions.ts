import { api } from "@/services/api";
import type { AxiosError } from "axios";

export const PERMISSION_ENTITIES = ["User", "Member", "Subscription", "Payment", "Attendance"] as const;
export const PERMISSION_ACTIONS = ["read", "create", "edit", "delete"] as const;

export type PermissionEntity = (typeof PERMISSION_ENTITIES)[number];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface Permission {
    id: string;
    entity: string;
    action: string;
    createdAt: string;
}

export interface RolePermission {
    id: string;
    permission: { id: string; entity: string; action: string };
}

export interface AssignPermissionPayload {
    roleId: string;
    entity: PermissionEntity;
    action: PermissionAction;
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

export async function getAllPermissions(): Promise<Permission[]> {
    try {
        const { data } = await api.get<Permission[]>("/permissions", { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getPermissionsByRole(roleId: string): Promise<RolePermission[]> {
    try {
        const { data } = await api.get<RolePermission[]>(`/permissions/roles/${roleId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function assignPermission(payload: AssignPermissionPayload): Promise<RolePermission> {
    try {
        const { data } = await api.post<RolePermission>("/permissions/assign", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function revokePermission(payload: AssignPermissionPayload): Promise<void> {
    try {
        await api.delete("/permissions/revoke", { headers: getAuthHeaders(), data: payload });
    } catch (error) {
        handleError(error);
    }
}
