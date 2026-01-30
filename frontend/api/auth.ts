const API_URL = "http://localhost:8001";

export const authApi = {
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("erreur d'inscription");
    return res.json();
  },
  login: async (data: any) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("id incorrects");
    return res.json();
  },
  githubAuth: async (code: string) => {
    const res = await fetch(`${API_URL}/auth/github?code=${code}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Erreur authentification GitHub");
    return res.json();
  },
};
