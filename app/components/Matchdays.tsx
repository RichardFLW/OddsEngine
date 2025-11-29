"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { SeasonStandings } from "@/lib/ligue1";
import { getTeamIcon } from "@/lib/teamIcons";

const MATCHDAY_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const getTeamHref = (teamId: string) => `/teams/${teamId}`;

type Props = {
  seasons: SeasonStandings[];
};

export function Matchdays({ seasons }: Props) {
  const [selectedSeasonId, setSelectedSeasonId] = useState(
    () => seasons[0]?.id ?? "",
  );
  const [selectedMatchday, setSelectedMatchday] = useState<number>(() => {
    const matchdays = seasons[0]?.matchdays ?? [];
    return (
      matchdays[matchdays.length - 1]?.number ??
      matchdays[0]?.number ??
      1
    );
  });

  const activeSeason = useMemo(
    () => seasons.find((season) => season.id === selectedSeasonId) ?? seasons[0],
    [selectedSeasonId, seasons],
  );

  useEffect(() => {
    if (!activeSeason) return;
    const matchdays = activeSeason.matchdays;
    const fallback =
      matchdays[matchdays.length - 1]?.number ??
      matchdays[0]?.number ??
      1;
    setSelectedMatchday(fallback);
  }, [activeSeason?.id]);

  const activeMatchday = useMemo(() => {
    if (!activeSeason) return undefined;
    return (
      activeSeason.matchdays.find(
        (matchday) => matchday.number === selectedMatchday,
      ) ?? activeSeason.matchdays[activeSeason.matchdays.length - 1]
    );
  }, [activeSeason, selectedMatchday]);

  const formatMatchDate = (isoDate: string) => {
    const parts = MATCHDAY_DATE_FORMATTER.formatToParts(new Date(isoDate));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "";

    const weekday = get("weekday");
    const day = get("day");
    const month = get("month");
    const hour = get("hour");
    const minute = get("minute");

    return `${weekday} ${day} ${month} · ${hour}:${minute}`;
  };

  if (!activeSeason) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        Aucune saison disponible pour les matchdays pour le moment.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">
            Matchdays
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            {activeSeason.name}
          </h2>
          <p className="text-sm text-zinc-400">
            {activeSeason.matchdays.length} journees referencees
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col text-xs text-zinc-300 sm:text-sm">
            <span className="mb-2 uppercase tracking-[0.3em] text-[0.65rem]">
              Choisir la saison
            </span>
            <select
              value={selectedSeasonId}
              onChange={(event) => setSelectedSeasonId(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none transition focus:border-indigo-300 sm:w-56"
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs text-zinc-300 sm:text-sm">
            <span className="mb-2 uppercase tracking-[0.3em] text-[0.65rem]">
              Choisir la journee
            </span>
            <select
              value={selectedMatchday}
              onChange={(event) => setSelectedMatchday(Number(event.target.value))}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none transition focus:border-indigo-300 sm:w-48"
            >
              {activeSeason.matchdays.map((matchday) => (
                <option key={matchday.number} value={matchday.number}>
                  Journee {matchday.number}
                </option>
              ))}
            </select>
          </label>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/10 sm:text-sm"
          >
            ← Retour au classement
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {activeMatchday?.matches?.map((match) => (
          <article
            key={match.id}
            className="flex w-full flex-col items-center gap-3 rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-center shadow-sm shadow-black/30 sm:px-6 sm:py-4"
          >
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-zinc-400">
                {formatMatchDate(match.playedAt)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-base font-semibold text-white sm:gap-4 sm:text-lg">
                <Link
                  href={getTeamHref(match.homeTeamId)}
                  className="flex items-center gap-2 transition hover:text-indigo-200"
                >
                  {(() => {
                    const icon = getTeamIcon(match.homeTeamName);
                    return icon ? (
                      <Image
                        src={icon}
                        alt={`Logo ${match.homeTeamName}`}
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                      />
                    ) : (
                      <div className="h-7 w-7 shrink-0 rounded-full border border-white/10 sm:h-8 sm:w-8" />
                    );
                  })()}
                  <span className="text-base sm:text-lg">{match.homeTeamName}</span>
                </Link>
                <span className="rounded-lg bg-white/5 px-3 py-1 text-sm font-semibold text-white sm:text-base">
                  {match.homeScore}
                </span>
                <span className="text-xs font-normal uppercase tracking-wide text-zinc-400">
                  vs
                </span>
                <span className="rounded-lg bg-white/5 px-3 py-1 text-sm font-semibold text-white sm:text-base">
                  {match.awayScore}
                </span>
                <Link
                  href={getTeamHref(match.awayTeamId)}
                  className="flex items-center gap-2 transition hover:text-indigo-200"
                >
                  {(() => {
                    const icon = getTeamIcon(match.awayTeamName);
                    return icon ? (
                      <Image
                        src={icon}
                        alt={`Logo ${match.awayTeamName}`}
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                      />
                    ) : (
                      <div className="h-7 w-7 shrink-0 rounded-full border border-white/10 sm:h-8 sm:w-8" />
                    );
                  })()}
                  <span className="text-base sm:text-lg">{match.awayTeamName}</span>
                </Link>
              </div>
            </div>
          </article>
        ))}

        {activeMatchday?.matches?.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aucune rencontre enregistree pour cette journee.
          </p>
        ) : null}
      </div>
    </section>
  );
}
