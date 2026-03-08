import { api } from "@/services/api";
import { AxiosError } from "axios";

export type AuthRole = "ADMIN" | "TRAINER";

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface RegisterResponse {
    status: "ok" | "success";
    message: string;
}

export interface ForgotPasswordResponse {
    status: "ok" | "success";
    message: string;
}

function handleApiError(error: unknown): never {
    if (error instanceof AxiosError) {
        const message =
            (error.response?.data as { message?: string } | undefined)?.message ??
            error.message;
        throw new Error(message);
    }

    throw error instanceof Error ? error : new Error("Unexpected request error");
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
        const { data } = await api.post<LoginResponse>("/auth/login", {
            email,
            password,
        });

        return data;
    } catch (error) {
        handleApiError(error);
    }
}

export async function registerUser(
    email: string,
    password: string,
    role: AuthRole,
): Promise<RegisterResponse> {
    try {
        const { data } = await api.post<RegisterResponse>("/auth/register", {
            email,
            password,
            role,
        });

        return data;
    } catch (error) {
        handleApiError(error);
    }
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
        const { data } = await api.post<ForgotPasswordResponse>("/auth/forgot-password", {
            email,
        });

        return data;
    } catch (error) {
        handleApiError(error);
    }
}
