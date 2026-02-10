"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setUserEmail(user.email);
      fetch(`http://localhost:8001/user/service-status?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setIsConnected(data.github_connected);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (error) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleConnectGithub = () => {
    const clientID = "Ov23liEKLOerncA5uYnG"; 
    const redirectUri = "http://localhost:3001/auth/callback";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&scope=user:email,repo`;
  };

  const fetchRepos = async () => {
    try {
      const res = await fetch(`http://localhost:8001/github/repos?email=${userEmail}`);
      if (!res.ok) {
        alert("erreur recup des repos");
        return;
      }
      const data = await res.json();
      setRepos(data);
    } catch (error) {
      alert("erreur de connexion");
    }
  };

  // RÉACTION : Créer un dépôt
  const triggerReaction = async () => {
    try {
      const res = await fetch(`http://localhost:8001/github/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Réaction : Dépôt créé sur GitHub !");
      } else {
        alert("Erreur lors de la création du dépôt");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">Chargement...</div>;
  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow-md border-b">
        <div className="text-xl font-extrabold text-blue-600 tracking-tight">
          AREA <span className="text-gray-400 font-light">| Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase font-semibold">Utilisateur</span>
            <span className="text-sm font-medium">{userEmail}</span>
          </div>
          <button onClick={handleLogout} className="rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-600 transition-all">
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CASE CONNEXION */}
        <div className="bg-white p-8 rounded-xl shadow-md border text-center">
          <h2 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest">Service GitHub</h2>
          <button 
            onClick={!isConnected ? handleConnectGithub : undefined}
            className={`w-full py-3 rounded-lg font-bold transition-all ${isConnected ? "bg-green-500 text-white cursor-default" : "bg-black text-white hover:bg-gray-800"}`}
          >
            {isConnected ? "Connecté" : "Lier GitHub"}
          </button>
        </div>

        {/* CASE ACTION */}
        <div className={`bg-white p-8 rounded-xl shadow-md border text-center ${!isConnected && "opacity-40"}`}>
          <h2 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest">Action</h2>
          <button onClick={fetchRepos} disabled={!isConnected} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4">
            Lister mes repos
          </button>
          <div className="text-left text-xs space-y-1 max-h-32 overflow-y-auto">
            {repos.length === 0 ? (
              <p className="text-gray-400 text-center">Aucun dépôt affiché</p>
            ) : (
              repos.slice(0, 5).map(r => (
                <div key={r.id} className="border-b pb-1 truncate">
                  {r.name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* CASE RÉACTION */}
        <div className={`bg-white p-8 rounded-xl shadow-md border text-center ${!isConnected && "opacity-40"}`}>
          <h2 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest">Réaction</h2>
          <button onClick={triggerReaction} disabled={!isConnected} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Créer un repo AREA
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Crée automatiquement un dépôt "areatest"
          </p>
        </div>
      </main>
    </div>
  );
}