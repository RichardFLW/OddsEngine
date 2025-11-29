"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SESSION_KEY = "odds-session";

type Role = "Administrateur" | "Analyste" | "Coach";

type StoredSession = {
  email: string;
  role: Role;
};

const roles: Role[] = ["Administrateur", "Analyste", "Coach"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Analyste");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as StoredSession;
      if (parsed?.email) setEmail(parsed.email);
      if (parsed?.role && roles.includes(parsed.role)) setRole(parsed.role);
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email et mot de passe sont requis.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulation d'authentification locale
      const session: StoredSession = { email, role };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      // Redirection vers le futur tableau de bord
      router.push("/dashboard");
    } catch {
      setError("Impossible de vous connecter pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-4 py-12">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
            Connexion
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Accès tableau de bord
          </h1>
          <p className="text-sm text-zinc-400">
            Email, mot de passe et rôle suffisent. L&apos;authentification sera
            branchée ultérieurement.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span>Adresse email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-indigo-300"
                placeholder="vous@club.fr"
                autoComplete="email"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span>Mot de passe</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-indigo-300"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span>Rôle</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-indigo-300"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {error ? <p className="text-sm text-amber-300">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </section>

        <div className="flex justify-center gap-3 text-sm text-zinc-300">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/20"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
