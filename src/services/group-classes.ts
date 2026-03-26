import { api } from "@/services/api";
import type { AxiosError } from "axios";

export type ClassType = "YOGA" | "ZUMBA" | "CROSSFIT" | "SPINNING" | "PILATES" | "BOXING" | "OTHER";

export const CLASS_TYPES: ClassType[] = ["YOGA", "ZUMBA", "CROSSFIT", "SPINNING", "PILATES", "BOXING", "OTHER"];

export interface GroupClassInstructor {
    id: string;
    email: string;
}

export interface GroupClassLocation {
    id: string;
    name: string;
}

export interface GroupClass {
    id: string;
    title: string;
    type: ClassType;
    instructor: GroupClassInstructor | null;
    location: GroupClassLocation;
    maxParticipants: number;
    scheduledAt: string;
    durationMinutes: number;
    isActive: boolean;
    _count: { bookings: number };
    createdAt: string;
    updatedAt: string;
}

export interface CreateGroupClassPayload {
    title: string;
    type: ClassType;
    instructorId?: string;
    locationId: string;
    maxParticipants: number;
    scheduledAt: string;
    durationMinutes: number;
    isActive?: boolean;
}

export interface UpdateGroupClassPayload {
    title?: string;
    type?: ClassType;
    instructorId?: string;
    locationId?: string;
    maxParticipants?: number;
    scheduledAt?: string;
    durationMinutes?: number;
    isActive?: boolean;
}

// Bookings
export interface ClassBookingMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}

export interface ClassBooking {
    id: string;
    classId: string;
    groupClass: {
        id: string;
        title: string;
        type: ClassType;
        scheduledAt: string;
        location: { id: string; name: string };
    };
    memberId: string;
    member: ClassBookingMember;
    status: "CONFIRMED" | "CANCELLED" | "ATTENDED";
    bookedAt: string;
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

// ── Group Classes ────────────────────────────────────────────────────────────

export async function getGroupClasses(): Promise<GroupClass[]> {
    try {
        const { data } = await api.get<GroupClass[]>("/classes", { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getUpcomingClasses(): Promise<GroupClass[]> {
    try {
        const { data } = await api.get<GroupClass[]>("/classes/upcoming", { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getClassesByLocation(locationId: string): Promise<GroupClass[]> {
    try {
        const { data } = await api.get<GroupClass[]>(`/classes/location/${locationId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getGroupClassById(id: string): Promise<GroupClass> {
    try {
        const { data } = await api.get<GroupClass>(`/classes/${id}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function createGroupClass(payload: CreateGroupClassPayload): Promise<GroupClass> {
    try {
        const { data } = await api.post<GroupClass>("/classes", payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateGroupClass(id: string, payload: UpdateGroupClassPayload): Promise<GroupClass> {
    try {
        const { data } = await api.patch<GroupClass>(`/classes/${id}`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteGroupClass(id: string): Promise<void> {
    try {
        await api.delete(`/classes/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}

// ── Class Bookings ───────────────────────────────────────────────────────────

export async function getClassBookings(classId: string): Promise<ClassBooking[]> {
    try {
        const { data } = await api.get<ClassBooking[]>(`/classes/${classId}/bookings`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function bookClass(classId: string, memberId: string): Promise<ClassBooking> {
    try {
        const { data } = await api.post<ClassBooking>(`/classes/${classId}/book`, { memberId }, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function cancelBooking(classId: string, memberId: string): Promise<ClassBooking> {
    try {
        const { data } = await api.delete<ClassBooking>(`/classes/${classId}/book/${memberId}`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}
