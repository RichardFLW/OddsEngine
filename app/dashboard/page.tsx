"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoredSession = {
  email: string;
};

const SESSION_KEY = "odds-session";

export default function DashboardPage() {
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as StoredSession;
      if (parsed?.email) {
        setSession(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 py-12">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
            Tableau de bord
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Espace connecté (placeholder)
          </h1>
          <p className="text-sm text-zinc-400">
            Contenu à brancher après implémentation de l&apos;authentification.
          </p>
        </header>

        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          {session ? (
            <div className="space-y-2 text-sm text-zinc-200">
              <p>
                <span className="text-zinc-400">Email :</span> {session.email}
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">
              Aucune session détectée. Merci de vous connecter.
            </p>
          )}
        </section>

        <div className="flex justify-center gap-3 text-sm text-zinc-300">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/20"
          >
            ↺ Retour connexion
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/10 px-4 py-2 font-semibold text-indigo-100 transition hover:border-indigo-300 hover:bg-indigo-500/20"
          >
            ← Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
