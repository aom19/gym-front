import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const store = await cookies();
    const locale = store.get("lang")?.value ?? "ro";

    store.delete("accessToken");
    store.delete("user");

    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}
