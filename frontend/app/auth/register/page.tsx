"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const Submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Données envoyées:", formData);
  };

  const GithubRegister = () => {
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={Submit} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-black text-2xl font-bold mb-6 text-center">INSCRIPTION</h1>
        {/* CO NORMAL */}
        <input type="email"
            placeholder="Email"
            className="text-black w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
        />
        <input type="password"
            placeholder="Mot de passe"
            className="text-black w-full p-2 mb-6 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
        />

        {/* CO GITHUB */}
        <div className="flex items-center mb-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button type="button"
            onClick={GithubRegister}
            className="w-full flex items-center justify-center gap-2 bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors mb-5"
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            S'inscrire avec GitHub
        </button>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            S'inscrire
        </button>
        <p className="text-black text-sm text-center mt-4">
            Déjà un compte ? <Link href="/auth/login" className="text-blue-600">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}