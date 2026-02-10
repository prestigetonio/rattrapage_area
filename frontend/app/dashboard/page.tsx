"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
    } else {
      try {
        const user = JSON.parse(storedUser);
        setUserEmail(user.email);
        setLoading(false);
      } catch (error) {
        console.error("Erreur session:", error);
        router.push("/auth/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-black animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow-md border-b">
        <div className="text-xl font-extrabold text-blue-600 tracking-tight">
          AREA <span className="text-gray-400 font-light">| Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase font-semibold">Utilisateur</span>
            <span className="text-black text-sm font-medium">{userEmail}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-600 transition-all shadow-sm active:scale-95"
          >
            Déconnexion
          </button>
        </div>
      </nav>
      
    </div>
  );
}
