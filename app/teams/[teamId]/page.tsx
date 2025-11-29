import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getLigue1TeamProfile, getLigue1TeamSeasonData } from "@/lib/ligue1";
import { getTeamIcon } from "@/lib/teamIcons";
import { TeamSeasonSelector } from "./TeamSeasonSelector";

type PageProps = {
  params: Promise<{ teamId: string }>;
  searchParams?: Promise<{ season?: string }>;
};

export const revalidate = 3600;

export default async function TeamPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const profile = await getLigue1TeamProfile(resolvedParams.teamId);

  if (!profile) {
    return notFound();
  }

  const selectedSeasonId =
    resolvedSearchParams.season &&
    profile.seasons.some((season) => season.id === resolvedSearchParams.season)
      ? resolvedSearchParams.season
      : profile.latestSeasonId;

  const selectedSeasonTeamId =
    profile.seasons.find((season) => season.id === selectedSeasonId)?.teamId ??
    resolvedParams.teamId;

  const seasonData = await getLigue1TeamSeasonData(
    selectedSeasonTeamId,
    selectedSeasonId,
  );

  if (!seasonData) {
    return notFound();
  }

  const teamIcon = getTeamIcon(profile.teamName);
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(iso));

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-12 text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {teamIcon ? (
              <Image
                src={teamIcon}
                alt={`Logo ${profile.teamName}`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5 object-contain p-3"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl border border-dashed border-white/10" />
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
                Fiche equipe
              </p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                {profile.teamName}
              </h1>
              <p className="text-xs text-zinc-400">ID: {profile.teamId}</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-300 hover:text-indigo-100"
          >
            ← Retour au classement
          </Link>
        </header>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/20 via-zinc-900/40 to-black/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
                Saison selectionnee
              </p>
              <h2 className="text-xl font-semibold text-white">
                {seasonData.seasonName}
              </h2>
            </div>

            <label className="flex flex-col text-xs text-zinc-300 sm:text-sm">
              <span className="mb-2 uppercase tracking-[0.3em] text-[0.65rem]">
                Choisir une saison
              </span>
              <TeamSeasonSelector
                teamId={profile.teamId}
                seasons={profile.seasons}
                selectedSeasonId={selectedSeasonId}
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Victoires", value: seasonData.wins, color: "text-emerald-300" },
              { label: "Nuls", value: seasonData.draws, color: "text-amber-200" },
              { label: "Defaites", value: seasonData.losses, color: "text-rose-300" },
              { label: "Points", value: seasonData.points, color: "text-indigo-200" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  {item.label}
                </p>
                <p className={`mt-2 text-2xl font-semibold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Buts marques",
                total: seasonData.goalsFor,
                avg: seasonData.goalsForAvg,
                accent: "text-emerald-200",
              },
              {
                title: "Buts encaisses",
                total: seasonData.goalsAgainst,
                avg: seasonData.goalsAgainstAvg,
                accent: "text-rose-200",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-inner shadow-black/30"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  {item.title}
                </p>
                <p className={`mt-2 text-3xl font-semibold ${item.accent}`}>
                  {item.total}
                </p>
                <p className="text-sm text-zinc-400">
                  Moyenne par match :{" "}
                  <span className="text-white">{item.avg.toFixed(2)}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
            {profile.seasons.map((season) => (
              <Link
                key={season.id}
                href={`/teams/${profile.teamId}?season=${season.id}`}
                className={`rounded-full px-3 py-1 transition ${
                  season.id === selectedSeasonId
                    ? "bg-indigo-600/30 text-white"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {season.name}
              </Link>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 shadow-inner shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Serie des resultats
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {seasonData.matches.map((match) => {
                const base =
                  match.result === "V"
                    ? "bg-emerald-900/40 border-emerald-400/30 text-emerald-100"
                    : match.result === "N"
                      ? "bg-amber-900/30 border-amber-400/30 text-amber-100"
                      : "bg-rose-900/40 border-rose-400/30 text-rose-100";
                return (
                  <span
                    key={match.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${base}`}
                  >
                    {match.result}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Buts a domicile",
                data: seasonData.goalsHome,
                bg: "bg-emerald-900/20",
              },
              {
                title: "Buts a l'exterieur",
                data: seasonData.goalsAway,
                bg: "bg-blue-900/20",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-white/10 p-5 shadow-inner shadow-black/30 ${item.bg}`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  {item.title}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm font-semibold text-white">
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
                    <p className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
                      Max
                    </p>
                    <p className="text-lg">{item.data.max}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
                    <p className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
                      Min
                    </p>
                    <p className="text-lg">{item.data.min}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
                    <p className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
                      Moy.
                    </p>
                    <p className="text-lg">{item.data.avg.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Serie de victoires",
                value: seasonData.longestWinStreak,
                accent: "text-emerald-200",
                bg: "bg-emerald-900/30",
              },
              {
                label: "Serie de nuls",
                value: seasonData.longestDrawStreak,
                accent: "text-amber-200",
                bg: "bg-amber-900/20",
              },
              {
                label: "Serie de defaites",
                value: seasonData.longestLossStreak,
                accent: "text-rose-200",
                bg: "bg-rose-900/25",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border border-white/10 p-5 shadow-inner shadow-black/30 ${item.bg}`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  {item.label}
                </p>
                <p className={`mt-2 text-3xl font-semibold ${item.accent}`}>
                  {item.value}
                </p>
                <p className="text-xs text-zinc-400">Matches consecutifs</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 shadow-inner shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Totaux de buts par match (equipe + adversaire)
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Plus / Moins (Over / Under)
                </h3>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {seasonData.totals.map((line) => (
                <div
                  key={line.line}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Ligne {line.line} buts
                    </p>
                    <p className="text-xs text-zinc-400">
                      Combien de matches sont passes au-dessus / en dessous
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold text-white">
                    <span className="rounded-lg bg-emerald-900/40 px-3 py-1 text-emerald-100">
                      Au-dessus : {line.over}
                    </span>
                    <span className="rounded-lg bg-amber-900/40 px-3 py-1 text-amber-100">
                      En dessous : {line.under}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Historique des matchs</h3>
              <p className="text-xs text-zinc-400">
                {seasonData.matches.length} rencontres
              </p>
            </div>

            <div className="space-y-3">
              {seasonData.matches.map((match) => {
                const resultColor =
                  match.result === "V"
                    ? "bg-emerald-600/20 text-emerald-100 border-emerald-400/30"
                    : match.result === "N"
                      ? "bg-amber-600/20 text-amber-100 border-amber-400/30"
                      : "bg-rose-600/20 text-rose-100 border-rose-400/30";

                return (
                  <article
                    key={match.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${resultColor}`}
                      >
                        {match.result}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {match.isHome ? "Domicile" : "Exterieur"} vs{" "}
                          <Link
                            className="text-indigo-200 underline-offset-4 hover:underline"
                            href={`/teams/${match.opponentId}?season=${match.seasonId}`}
                          >
                            {match.opponentName}
                          </Link>
                        </p>
                        <p className="text-xs text-zinc-400">
                          {formatDate(match.playedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm font-semibold text-white">
                        {match.goalsFor} - {match.goalsAgainst}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {match.seasonName}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
