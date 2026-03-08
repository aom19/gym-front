import { NextResponse } from "next/server";

interface LoginBody {
    email?: string;
    password?: string;
}

interface BackendLoginResponse {
    accessToken: string;
    refreshToken: string;
    user?: {
        id: string;
        email: string;
        role: string;
        location?: {
            id: string;
            name: string;
        } | null;
        emailVerified?: boolean;
        createdAt?: string;
        updatedAt?: string;
    };
}

const BACKEND_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as LoginBody;

        if (!body.email || !body.password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const backendResponse = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: body.email,
                password: body.password,
            }),
            cache: "no-store",
        });

        const payload = (await backendResponse.json()) as BackendLoginResponse | { message?: string };

        if (!backendResponse.ok) {
            const message = typeof payload === "object" && payload && "message" in payload
                ? payload.message
                : "Login failed";

            return NextResponse.json({ message }, { status: backendResponse.status });
        }

        const data = payload as BackendLoginResponse;
        const response = NextResponse.json({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
        });

        response.cookies.set("accessToken", data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15,
        });

        response.cookies.set("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        if (data.user) {
            response.cookies.set("user", encodeURIComponent(JSON.stringify(data.user)), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        return response;
    } catch {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
    }
}
