import { api } from "@/services/api";
import type { AxiosError } from "axios";

export type MuscleGroup =
    | "CHEST" | "BACK" | "SHOULDERS" | "BICEPS" | "TRICEPS"
    | "LEGS" | "CORE" | "GLUTES" | "CARDIO" | "FULL_BODY" | "OTHER";

export const MUSCLE_GROUPS: MuscleGroup[] = [
    "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS",
    "LEGS", "CORE", "GLUTES", "CARDIO", "FULL_BODY", "OTHER",
];

export interface Exercise {
    id: string;
    name: string;
    description: string | null;
    muscleGroup: MuscleGroup;
    videoUrl: string | null;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExercisePayload {
    name: string;
    description?: string;
    muscleGroup: MuscleGroup;
    videoUrl?: string;
    imageUrl?: string;
}

export interface UpdateExercisePayload {
    name?: string;
    description?: string;
    muscleGroup?: MuscleGroup;
    videoUrl?: string;
    imageUrl?: string;
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

export async function getExercises(muscleGroup?: MuscleGroup): Promise<Exercise[]> {
    try {
        const params = muscleGroup ? { muscleGroup } : {};
        const { data } = await api.get<Exercise[]>("/exercises", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getExerciseById(id: string): Promise<Exercise> {
    try {
        const { data } = await api.get<Exercise>(`/exercises/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createExercise(payload: CreateExercisePayload): Promise<Exercise> {
    try {
        const { data } = await api.post<Exercise>("/exercises", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateExercise(id: string, payload: UpdateExercisePayload): Promise<Exercise> {
    try {
        const { data } = await api.patch<Exercise>(`/exercises/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteExercise(id: string): Promise<void> {
    try {
        await api.delete(`/exercises/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
