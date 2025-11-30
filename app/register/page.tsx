"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SESSION_KEY = "odds-session";

type StoredSession = {
  email: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password || !confirm) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session: StoredSession = { email };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      router.push("/dashboard");
    } catch {
      setError("Impossible de créer le compte pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 py-12">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
            Inscription
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Créez un compte test
          </h1>
          <p className="text-sm text-zinc-400">
            Cette étape simule la création d&apos;un compte. Branchez votre back-end
            plus tard pour la vraie inscription.
          </p>
        </header>

        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
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
                autoComplete="new-password"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              <span>Confirmer le mot de passe</span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-indigo-300"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>

            {error ? <p className="text-sm text-amber-300">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        </section>

        <div className="flex flex-col items-center gap-2 text-sm text-zinc-300">
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/20"
            >
              ← Retour connexion
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/10 px-4 py-2 font-semibold text-indigo-100 transition hover:border-indigo-300 hover:bg-indigo-500/20"
            >
              Accueil
            </Link>
          </div>
          <p className="text-xs text-zinc-400">
            Déjà un compte ? Connectez-vous pour accéder au tableau de bord.
          </p>
        </div>
      </div>
    </div>
  );
}
