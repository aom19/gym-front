"use client";

import { useParams, useRouter } from "next/navigation";
import { logout } from "@/utils/auth";

interface LogoutButtonProps {
    children: React.ReactNode;
    className?: string;
}

export function LogoutButton({ children, className }: LogoutButtonProps) {
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as string) ?? "ro";

    const handleClick = async () => {
        await logout();
        router.replace(`/${lang}/login`);
    };

    return (
        <button type="button" onClick={handleClick} className={className}>
            {children}
        </button>
    );
}
