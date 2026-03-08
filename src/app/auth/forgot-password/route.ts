import { NextResponse } from "next/server";

interface ForgotPasswordBody {
    email?: string;
}

const BACKEND_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as ForgotPasswordBody;

        if (!body.email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const backendResponse = await fetch(`${BACKEND_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: body.email }),
            cache: "no-store",
        });

        const payload = (await backendResponse.json()) as { message?: string; status?: "ok" | "success" };

        if (!backendResponse.ok) {
            return NextResponse.json(
                { message: payload.message ?? "Forgot password request failed" },
                { status: backendResponse.status },
            );
        }

        return NextResponse.json({
            status: payload.status ?? "ok",
            message: payload.message ?? "If the email exists, a reset link has been sent.",
        });
    } catch {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
    }
}
