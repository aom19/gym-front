import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3002";

async function getAuthHeader(): Promise<Record<string, string>> {
    const store = await cookies();
    const token = store.get("accessToken")?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET() {
    const authHeaders = await getAuthHeader();

    if (!authHeaders.Authorization) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backendRes = await fetch(`${BACKEND_BASE_URL}/users/preferences`, {
        headers: { ...authHeaders, "Content-Type": "application/json" },
        cache: "no-store",
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

export async function PATCH(request: NextRequest) {
    const authHeaders = await getAuthHeader();

    if (!authHeaders.Authorization) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as unknown;

    const backendRes = await fetch(`${BACKEND_BASE_URL}/users/preferences`, {
        method: "PATCH",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}
