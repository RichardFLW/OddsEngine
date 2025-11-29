import Image from "next/image";
import Link from "next/link";

import { getLigue1Teams } from "@/lib/ligue1";
import { getTeamIcon } from "@/lib/teamIcons";

export const revalidate = 3600;

export default async function TeamsIndexPage() {
  const teams = await getLigue1Teams();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-12 text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">
              Fiches equipes
            </p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Choisir une equipe
            </h1>
            <p className="text-sm text-zinc-400">
              Selectionnez une equipe pour afficher sa fiche detaillee et ses statistiques.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-300 hover:text-indigo-100"
          >
            ← Retour au classement
          </Link>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {teams.map((team) => {
              const icon = getTeamIcon(team.name);
              return (
                <Link
                  key={team.teamId}
                  href={`/teams/${team.teamId}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-black/30 p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-500/10"
                >
                  {icon ? (
                    <Image
                      src={icon}
                      alt={`Logo ${team.name}`}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-xl border border-white/10 bg-white/5 p-3 object-contain"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 text-xs text-zinc-400">
                      Icon
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white transition group-hover:text-indigo-200">
                    {team.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
