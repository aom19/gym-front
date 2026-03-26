import { api } from "@/services/api";
import type { AxiosError } from "axios";

export interface FitnessProgressMember {
    id: string;
    firstName: string;
    lastName: string;
}

export interface FitnessProgress {
    id: string;
    memberId: string;
    member: FitnessProgressMember;
    recordedAt: string;
    weight: string | null;
    bodyFat: string | null;
    measurements: Record<string, number> | null;
    notes: string | null;
}

export interface CreateFitnessProgressPayload {
    memberId: string;
    recordedAt?: string;
    weight?: number;
    bodyFat?: number;
    measurements?: Record<string, number>;
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

export async function getFitnessProgress(memberId: string): Promise<FitnessProgress[]> {
    try {
        const { data } = await api.get<FitnessProgress[]>(`/progress/member/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createFitnessProgress(payload: CreateFitnessProgressPayload): Promise<FitnessProgress> {
    try {
        const { data } = await api.post<FitnessProgress>("/progress", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteFitnessProgress(id: string): Promise<void> {
    try {
        await api.delete(`/progress/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
