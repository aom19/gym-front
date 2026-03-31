import { api } from "@/services/api";
import type { AxiosError } from "axios";
import type { MuscleGroup } from "./exercises";
import type { PaginationParams, PaginatedResult } from "@/hooks/useServerTable";

export interface WorkoutExerciseItem {
    id: string;
    sets: number;
    reps: number;
    weight: string | null;
    duration: number | null;
    order: number;
    exercise: {
        id: string;
        name: string;
        muscleGroup: MuscleGroup;
    };
}

export interface WorkoutMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}

export interface WorkoutTrainer {
    id: string;
    email: string;
}

export interface Workout {
    id: string;
    title: string;
    date: string;
    notes: string | null;
    trainer: WorkoutTrainer | null;
    member: WorkoutMember | null;
    exercises: WorkoutExerciseItem[];
    createdAt: string;
    updatedAt: string;
}

export interface WorkoutExercisePayload {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    order?: number;
}

export interface CreateWorkoutPayload {
    title: string;
    date: string;
    trainerId?: string;
    memberId?: string;
    notes?: string;
    exercises: WorkoutExercisePayload[];
}

export interface UpdateWorkoutPayload {
    title?: string;
    date?: string;
    trainerId?: string;
    memberId?: string;
    notes?: string;
    exercises?: WorkoutExercisePayload[];
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

export async function getWorkouts(params?: PaginationParams): Promise<PaginatedResult<Workout>> {
    try {
        const { data } = await api.get<PaginatedResult<Workout>>("/workouts", { headers: getAuthHeaders(), params });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getWorkoutsByMember(memberId: string): Promise<Workout[]> {
    try {
        const { data } = await api.get<Workout[]>(`/workouts/member/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getWorkoutById(id: string): Promise<Workout> {
    try {
        const { data } = await api.get<Workout>(`/workouts/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createWorkout(payload: CreateWorkoutPayload): Promise<Workout> {
    try {
        const { data } = await api.post<Workout>("/workouts", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateWorkout(id: string, payload: UpdateWorkoutPayload): Promise<Workout> {
    try {
        const { data } = await api.patch<Workout>(`/workouts/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteWorkout(id: string): Promise<void> {
    try {
        await api.delete(`/workouts/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
