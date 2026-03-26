import { api } from "@/services/api";
import type { AxiosError } from "axios";

export interface ScheduleDay {
    id: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface SetSchedulePayload {
    schedule: {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }[];
}

export interface LocationHoliday {
    id: string;
    date: string;
    name: string;
}

export interface CreateHolidayPayload {
    date: string;
    name: string;
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

export async function getLocationSchedule(locationId: string): Promise<ScheduleDay[]> {
    try {
        const { data } = await api.get<ScheduleDay[]>(`/locations/${locationId}/schedule`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function setLocationSchedule(locationId: string, payload: SetSchedulePayload): Promise<ScheduleDay[]> {
    try {
        const { data } = await api.put<ScheduleDay[]>(`/locations/${locationId}/schedule`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function getLocationHolidays(locationId: string): Promise<LocationHoliday[]> {
    try {
        const { data } = await api.get<LocationHoliday[]>(`/locations/${locationId}/holidays`, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function addLocationHoliday(locationId: string, payload: CreateHolidayPayload): Promise<LocationHoliday> {
    try {
        const { data } = await api.post<LocationHoliday>(`/locations/${locationId}/holidays`, payload, { headers: getAuthHeaders() });
        return data;
    } catch (error) {
        handleError(error);
    }
}

export async function removeLocationHoliday(holidayId: string): Promise<void> {
    try {
        await api.delete(`/locations/holidays/${holidayId}`, { headers: getAuthHeaders() });
    } catch (error) {
        handleError(error);
    }
}
