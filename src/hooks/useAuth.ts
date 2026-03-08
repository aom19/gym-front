"use client";

import { useMutation } from "@tanstack/react-query";
import {
    forgotPassword,
    loginUser,
    registerUser,
    type AuthRole,
    type ForgotPasswordResponse,
    type LoginResponse,
    type RegisterResponse,
} from "@/services/auth";
import { useStore } from "@/store/useStore";

export function useLogin() {
    const setTokens = useStore((state) => state.setTokens);

    return useMutation<LoginResponse, Error, { email: string; password: string }>({
        mutationFn: ({ email, password }) => loginUser(email, password),
        onSuccess: (data) => {
            setTokens(data.accessToken, data.refreshToken);
        },
    });
}

export function useRegister() {
    return useMutation<RegisterResponse, Error, { email: string; password: string; role: AuthRole }>({
        mutationFn: ({ email, password, role }) => registerUser(email, password, role),
    });
}

export function useForgotPassword() {
    return useMutation<ForgotPasswordResponse, Error, { email: string }>({
        mutationFn: ({ email }) => forgotPassword(email),
    });
}
