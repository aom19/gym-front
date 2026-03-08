import { NextResponse } from "next/server";

interface ResetPasswordBody {
    password?: string;
    confirmPassword?: string;
}

const BACKEND_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Reset token is required" }, { status: 400 });
        }

        const body = (await request.json()) as ResetPasswordBody;

        if (!body.password || !body.confirmPassword) {
            return NextResponse.json(
                { message: "Password and confirmPassword are required" },
                { status: 400 },
            );
        }

        const backendResponse = await fetch(
            `${BACKEND_BASE_URL}/auth/reset-password?token=${encodeURIComponent(token)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: body.password,
                    confirmPassword: body.confirmPassword,
                }),
                cache: "no-store",
            },
        );

        const payload = (await backendResponse.json()) as { message?: string; status?: "ok" | "success" };

        if (!backendResponse.ok) {
            return NextResponse.json(
                { message: payload.message ?? "Reset password failed" },
                { status: backendResponse.status },
            );
        }

        return NextResponse.json({
            status: payload.status ?? "success",
            message: payload.message ?? "Password has been reset successfully.",
        });
    } catch {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
    }
}
