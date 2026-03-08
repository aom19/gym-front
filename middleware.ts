import { NextRequest, NextResponse } from "next/server";

interface JwtPayload {
    role?: string;
    exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    try {
        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

        const decoded = Buffer.from(payload, "base64").toString("utf8");
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    if (!request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = decodeJwtPayload(token);

    if (!payload || payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
