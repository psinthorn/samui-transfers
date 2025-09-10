"use client"

import { useRouter } from "next/navigation";

interface LoginButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const LoginButton = ({ 
    children, 
    mode, 
    asChild = false }: LoginButtonProps) => {

    const router = useRouter()

    const onClick = () => {
        if (mode === "redirect") {
            router.push("/auth/login");
        } else {
            // Handle modal login (not implemented in this snippet)
            console.log("Open login modal");
        }
    }

    return (
        <span className="cursor-pointer" onClick={onClick}>
            {children}
        </span>
    )
}