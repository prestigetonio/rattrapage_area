"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/api/auth";

export default function Callback() {
    const router = useRouter();
    const code = useSearchParams().get("code");
    useEffect(() => {
        if (code) {
            authApi.githubAuth(code).then((res) => {
                localStorage.setItem("user", JSON.stringify(res));
                router.push("/dashboard");
            });
        }
    }, [code]);
    return;
}
