"use client";

import { useMemo, useState } from "react";

import type { SimulationSeason, TeamInfo } from "@/lib/ligue1";

type Props = {
  teams: TeamInfo[];
  seasons: SimulationSeason[];
};

type ComputedMatch = {
  id: string;
  seasonId: string;
  seasonName: string;
  playedAt: string;
  opponentName: string;
  favouriteTeamName: string;
  favouriteOdds: number;
  score: string;
  favouriteWon: boolean;
  netProfit: number;
  cumulative: number;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function SimulationClient({ teams, seasons }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState(
    teams[0]?.teamId ?? "",
  );
  const [stakeInput, setStakeInput] = useState("10");

  const {
    matches,
    totalProfit,
    invested,
    roi,
    seasonBreakdown,
    chartPoints,
    minY,
    maxY,
  } = useMemo(() => {
    const targetTeam =
      teams.find((team) => team.teamId === selectedTeamId) ?? teams[0];
    const normalizedStake = Math.max(
      1,
      Number.parseFloat(stakeInput.replace(",", ".")) || 0,
    );

    if (!targetTeam) {
      return {
        matches: [],
        totalProfit: 0,
        invested: 0,
        roi: 0,
        seasonBreakdown: [],
        chartPoints: [],
        minY: 0,
        maxY: 0,
      };
    }

    const targetName = targetTeam.name.toLowerCase();

    const rawMatches = seasons
      .flatMap((season) =>
        season.matches
          .filter(
            (match) =>
              match.homeTeamName.toLowerCase() === targetName ||
              match.awayTeamName.toLowerCase() === targetName,
          )
          .map((match) => ({ ...match, seasonName: season.name })),
      )
      .filter(
        (match) =>
          match.favouriteOdds &&
          match.favouriteTeamId &&
          match.winnerTeamId !== undefined,
      )
      .sort(
        (a, b) =>
          new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
      );

    const computed: ComputedMatch[] = [];
    let cumulative = 0;

    for (const match of rawMatches) {
      const favouriteWon =
        match.winnerTeamId !== null &&
        match.winnerTeamId === match.favouriteTeamId;
      const netProfit = favouriteWon
        ? normalizedStake * (match.favouriteOdds - 1)
        : -normalizedStake;
      cumulative += netProfit;

      const opponentName =
        match.homeTeamName.toLowerCase() === targetName
          ? match.awayTeamName
          : match.homeTeamName;

      computed.push({
        id: match.id,
        seasonId: match.seasonId,
        seasonName: match.seasonName,
        playedAt: match.playedAt,
        opponentName,
        favouriteTeamName: match.favouriteTeamName,
        favouriteOdds: match.favouriteOdds,
        score: `${match.homeScore} - ${match.awayScore}`,
        favouriteWon,
        netProfit,
        cumulative,
      });
    }

    const totalProfit = computed.reduce((acc, match) => acc + match.netProfit, 0);
    const invested = computed.length * normalizedStake;
    const roi = invested > 0 ? (totalProfit / invested) * 100 : 0;

    const seasonBreakdown = computed.reduce<
      { id: string; name: string; profit: number; matches: number }[]
    >((acc, match) => {
      const existing = acc.find((item) => item.id === match.seasonId);
      if (existing) {
        existing.profit += match.netProfit;
        existing.matches += 1;
      } else {
        acc.push({
          id: match.seasonId,
          name: match.seasonName,
          profit: match.netProfit,
          matches: 1,
        });
      }
      return acc;
    }, []);

    const chartPoints = computed.map((match, index) => ({
      index,
      value: match.cumulative,
      label: dateFormatter.format(new Date(match.playedAt)),
    }));

    const values = chartPoints.map((point) => point.value);
    const minY = Math.min(0, ...values);
    const maxY = Math.max(0, ...values);

    return {
      matches: computed,
      totalProfit,
      invested,
      roi,
      seasonBreakdown,
      chartPoints,
      minY,
      maxY,
    };
  }, [seasons, selectedTeamId, stakeInput, teams]);

  const chartWidth = 760;
  const chartHeight = 240;

  const chartPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const range = maxY - minY || 1;
    const coords = chartPoints.map((point, index) => {
      const x =
        chartPoints.length === 1
          ? chartWidth / 2
          : (index / (chartPoints.length - 1)) * chartWidth;
      const y =
        chartHeight -
        ((point.value - minY) / range) * chartHeight;
      return `${x},${y}`;
    });
    return coords.join(" ");
  }, [chartPoints, chartHeight, chartWidth, maxY, minY]);
  const cumulativeList = useMemo(
    () =>
      matches.map((match, index) => ({
        id: match.id,
        date: dateFormatter.format(new Date(match.playedAt)),
        opponent: match.opponentName,
        cumulative: chartPoints[index]?.value ?? 0,
      })),
    [chartPoints, matches],
  );

  if (teams.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
        Aucun club disponible pour la simulation.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/40 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
            Choix de la mise
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-xl text-zinc-400">€</span>
            <input
              type="number"
              min={1}
              step={1}
              value={stakeInput}
              onChange={(event) => setStakeInput(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-2xl font-semibold text-white outline-none transition focus:border-indigo-300"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
            {["5", "10", "20", "50"].map((preset) => (
              <button
                key={preset}
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/20"
                onClick={() => setStakeInput(preset)}
              >
                {preset} €
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/40 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
            Choix de l&apos;équipe
          </p>
          <select
            value={selectedTeamId}
            onChange={(event) => setSelectedTeamId(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-300"
          >
            {teams.map((team) => (
              <option key={team.teamId} value={team.teamId}>
                {team.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-400">
            Nous simulons chaque match des saisons disponibles pour ce club en pariant sur le favori
            du match (côte la plus basse).
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Gain / perte total",
            value: currencyFormatter.format(totalProfit),
            accent:
              totalProfit >= 0
                ? "text-emerald-200 border-emerald-400/40 bg-emerald-900/20"
                : "text-rose-200 border-rose-400/40 bg-rose-900/30",
          },
          {
            label: "Mise engagée",
            value: currencyFormatter.format(invested),
            accent: "text-indigo-200 border-indigo-400/30 bg-indigo-900/20",
          },
          {
            label: "ROI simulé",
            value: `${roi.toFixed(1)} %`,
            accent:
              roi >= 0
                ? "text-emerald-200 border-emerald-400/40 bg-emerald-900/20"
                : "text-rose-200 border-rose-400/40 bg-rose-900/30",
          },
          {
            label: "Matches utilisés",
            value: matches.length.toString(),
            accent: "text-amber-200 border-amber-400/30 bg-amber-900/20",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border px-4 py-3 shadow-inner shadow-black/30 ${item.accent}`}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-300">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/20 via-zinc-900/40 to-black/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
              Evolution cumulée
            </p>
            <h3 className="text-xl font-semibold text-white">
              Gains / pertes au fil du temps
            </h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            Basé sur les cotes finales disponibles avec résultat connu.
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[3fr,1.2fr]">
          {chartPoints.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Aucun match exploitable pour ce club avec des cotes valides.
            </p>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="h-64 w-full"
                  role="img"
                  aria-label="Courbe des gains cumulés"
                >
                  <defs>
                    <linearGradient id="gainGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  <line
                    x1={0}
                    x2={chartWidth}
                    y1={
                      chartHeight -
                      ((0 - minY) / (maxY - minY || 1)) * chartHeight
                    }
                    y2={
                      chartHeight -
                      ((0 - minY) / (maxY - minY || 1)) * chartHeight
                    }
                    className="stroke-zinc-700"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />

                  <polyline
                    fill="none"
                    stroke="url(#gainGradient)"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={chartPath}
                  />

                  {chartPoints.map((point, index) => {
                    const range = maxY - minY || 1;
                    const x =
                      chartPoints.length === 1
                        ? chartWidth / 2
                        : (index / (chartPoints.length - 1)) * chartWidth;
                    const y =
                      chartHeight -
                      ((point.value - minY) / range) * chartHeight;
                    return (
                      <g key={point.label}>
                        <circle
                          cx={x}
                          cy={y}
                          r={4}
                          className={
                            point.value >= 0 ? "fill-emerald-300" : "fill-rose-300"
                          }
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
                  Cumul réel
                </p>
                <p className="text-xs text-zinc-400">
                  Cumuls calculés sur tous les matchs simulés.
                </p>
                <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white max-h-80 overflow-y-auto">
                  {cumulativeList.length === 0 ? (
                    <p className="text-xs text-zinc-400">
                      Aucun match avec données valides.
                    </p>
                  ) : (
                    [...cumulativeList]
                      .reverse()
                      .map((item, index) => {
                        const displayIndex = cumulativeList.length - index;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="text-[0.7rem] uppercase text-zinc-400">
                                Match {displayIndex}
                              </span>
                              <span className="text-xs text-zinc-300">
                                {item.date} • vs {item.opponent}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-indigo-100">
                              {currencyFormatter.format(item.cumulative)}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {seasonBreakdown.length > 0 && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {seasonBreakdown.map((season) => (
            <div
              key={season.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                {season.name}
              </p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  season.profit >= 0 ? "text-emerald-200" : "text-rose-200"
                }`}
              >
                {currencyFormatter.format(season.profit)}
              </p>
              <p className="text-xs text-zinc-400">
                {season.matches} matches pris en compte
              </p>
            </div>
          ))}
        </section>
      )}

      {matches.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
                Détail des dernières rencontres
              </p>
              <h3 className="text-lg font-semibold text-white">
                Pertes / gains match par match
              </h3>
            </div>
            <div className="text-xs text-zinc-400">
              Affichage des {Math.min(matches.length, 12)} derniers matchs.
            </div>
          </div>

          <div className="space-y-3">
            {matches
              .slice(-12)
              .reverse()
              .map((match) => (
                <article
                  key={match.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      vs {match.opponentName} • {match.score}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {dateFormatter.format(new Date(match.playedAt))} — favori :{" "}
                      <span className="text-indigo-200">{match.favouriteTeamName}</span>{" "}
                      ({match.favouriteOdds.toFixed(2)})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        match.favouriteWon
                          ? "bg-emerald-900/40 text-emerald-100 border border-emerald-500/40"
                          : "bg-rose-900/40 text-rose-100 border border-rose-500/40"
                      }`}
                    >
                      {match.favouriteWon ? "Pari gagnant" : "Perdu"}
                    </span>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        match.netProfit >= 0
                          ? "bg-emerald-900/30 text-emerald-100 border border-emerald-500/40"
                          : "bg-rose-900/30 text-rose-100 border border-rose-500/40"
                      }`}
                    >
                      {match.netProfit >= 0 ? "+" : ""}
                      {currencyFormatter.format(match.netProfit)}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
