import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

interface JwtPayload {
    role?: string;
    exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const b64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
        return JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as JwtPayload;
    } catch {
        return null;
    }
}

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip internal Next.js routes and static assets
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.match(/\.\w+$/)
    ) {
        return NextResponse.next();
    }

    // Skip API route handlers — they handle their own auth
    if (pathname.startsWith("/auth/") || pathname.startsWith("/users/")) {
        return NextResponse.next();
    }

    // Protect /{lang}/admin/* routes
    if (/^\/(?:ro|en|ru)\/admin/.test(pathname)) {
        const token = request.cookies.get("accessToken")?.value;
        const locale = pathname.split("/")[1] ?? "ro";

        if (!token) {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
        }

        const payload = decodeJwtPayload(token);

        if (
            !payload ||
            payload.role !== "ADMIN" ||
            (payload.exp && payload.exp * 1000 < Date.now())
        ) {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
        }
    }

    // Let next-intl handle locale detection / prefixing for everything else
    return intlMiddleware(request);
}

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)"],
};

