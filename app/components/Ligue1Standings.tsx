"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import type { SeasonStandings } from "@/lib/ligue1";

const TEAM_ICON_MAP: Record<string, string> = {
  "Paris-SG": "/icons/teams/psg.png",
  Marseille: "/icons/teams/marseille.png",
  Monaco: "/icons/teams/monaco.png",
  Nice: "/icons/teams/nice.png",
  Lille: "/icons/teams/lille.png",
  Lyon: "/icons/teams/lyon.png",
  Strasbourg: "/icons/teams/strasbourg.png",
  Lens: "/icons/teams/lens.png",
  Brest: "/icons/teams/brest.png",
  Toulouse: "/icons/teams/toulouse.png",
  Auxerre: "/icons/teams/auxerre.png",
  Rennes: "/icons/teams/rennes.png",
  Nantes: "/icons/teams/nantes.png",
  Angers: "/icons/teams/angers.png",
  "Le Havre": "/icons/teams/lehavre.png",
  Reims: "/icons/teams/reims.png",
  "Saint-Etienne": "/icons/teams/stetienne.png",
  Montpellier: "/icons/teams/montpellier.png",
  Lorient: "/icons/teams/lorient.png",
  Metz: "/icons/teams/metz.png",
  "Paris FC":"/icons/teams/parisfc.png",
};

const getTeamIcon = (teamName: string) => TEAM_ICON_MAP[teamName] ?? null;

type Props = {
  seasons: SeasonStandings[];
};

export function Ligue1Standings({ seasons }: Props) {
  const [selectedId, setSelectedId] = useState(() => seasons[0]?.id ?? "");

  const activeSeason = useMemo(
    () => seasons.find((season) => season.id === selectedId) ?? seasons[0],
    [selectedId, seasons],
  );

  if (!activeSeason) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
        Aucune saison disponible pour le moment.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-indigo-300">
            Saison
          </p>
          <h2 className="text-2xl font-semibold text-white">{activeSeason.name}</h2>
          <p className="text-sm text-zinc-400">
            {activeSeason.standings.length > 0
              ? `${activeSeason.standings.length} equipes classees`
              : "Aucun match termine"}
          </p>
        </div>

        <label className="flex flex-col text-sm text-zinc-300">
          <span className="mb-3 uppercase tracking-[0.3em] text-xs">
            Choisir une saison
          </span>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-300 sm:w-64"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeSeason.standings.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[640px] w-full table-auto border-separate border-spacing-y-2 text-xs sm:text-sm">
            <thead className="text-[0.65rem] uppercase tracking-widest text-zinc-400 sm:text-xs">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Equipe</th>
                <th className="px-3 py-2 text-right">MJ</th>
                <th className="px-3 py-2 text-right">V</th>
                <th className="px-3 py-2 text-right">N</th>
                <th className="px-3 py-2 text-right">D</th>
                <th className="px-3 py-2 text-right">BP</th>
                <th className="px-3 py-2 text-right">BC</th>
                <th className="px-3 py-2 text-right">Diff</th>
                <th className="px-3 py-2 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {activeSeason.standings.map((team, index) => {
                const icon = getTeamIcon(team.teamName);
                return (
                  <tr
                    key={team.teamId}
                    className="rounded-2xl bg-white/5 text-white"
                  >
                    <td className="rounded-l-2xl px-3 py-2 text-left text-xs text-zinc-400 sm:text-sm lg:text-base">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium">
                      <div className="flex items-center gap-4 lg:gap-6">
                        {icon ? (
                          <Image
                            src={icon}
                            alt={`Logo ${team.teamName}`}
                            width={32}
                            height={32}
                            className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                            style={{ objectFit: "contain" }}
                          />
                        ) : (
                          <div className="h-7 w-7 shrink-0 border border-dashed border-white/10 sm:h-8 sm:w-8" />
                        )}
                        <span className="text-sm sm:text-base lg:text-lg">
                          {team.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-zinc-200 sm:text-sm lg:text-base">
                      {team.played}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-zinc-200 sm:text-sm lg:text-base">
                      {team.wins}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-zinc-200 sm:text-sm lg:text-base">
                      {team.draws}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-zinc-200 sm:text-sm lg:text-base">
                      {team.losses}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-zinc-100 sm:text-sm lg:text-base">
                      {team.goalsFor}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-zinc-100 sm:text-sm lg:text-base">
                      {team.goalsAgainst}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-amber-300 sm:text-sm lg:text-base">
                      {team.goalDifference >= 0 ? "+" : ""}
                      {team.goalDifference}
                    </td>
                    <td className="rounded-r-2xl px-3 py-2 text-right text-sm font-semibold text-white sm:text-lg lg:text-xl">
                      {team.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-sm text-zinc-400">
          Le classement sera disponible lorsque des matchs auront ete joues.
        </p>
      )}
    </section>
  );
}
