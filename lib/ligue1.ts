import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

type DbFile = {
  seasonOrder: string[];
};

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  playedAt: string;
  homeScore: number;
  awayScore: number;
};

type SeasonFile = {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  matchdays?: { number: number; matchIds: string[] }[];
};

export type TeamStanding = {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type SeasonStandings = {
  id: string;
  name: string;
  standings: TeamStanding[];
  matchdays: Matchday[];
};

export type MatchdayMatch = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  playedAt: string;
  homeScore: number;
  awayScore: number;
};

export type Matchday = {
  number: number;
  matches: MatchdayMatch[];
};

const DATA_ROOT = path.join(process.cwd(), "data");
const LIGUE1_SEASONS_DIR = path.join(DATA_ROOT, "france", "ligue1", "seasons");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const file = await readFile(filePath, "utf8");
  return JSON.parse(file) as T;
}

function ensureTeam(
  map: Map<string, TeamStanding>,
  teamId: string,
  fallbackName: string,
): TeamStanding {
  if (!map.has(teamId)) {
    map.set(teamId, {
      teamId,
      teamName: fallbackName,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  return map.get(teamId)!;
}

function calculateStandings(season: SeasonFile): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();
  const teamNameById = new Map(season.teams.map((team) => [team.id, team.name]));

  for (const match of season.matches) {
    // Ignore matches that are missing a score.
    if (
      typeof match.homeScore !== "number" ||
      typeof match.awayScore !== "number"
    ) {
      continue;
    }

    const homeStats = ensureTeam(
      standingsMap,
      match.homeTeamId,
      teamNameById.get(match.homeTeamId) ?? "Equipe inconnue",
    );
    const awayStats = ensureTeam(
      standingsMap,
      match.awayTeamId,
      teamNameById.get(match.awayTeamId) ?? "Equipe inconnue",
    );

    homeStats.played += 1;
    awayStats.played += 1;

    homeStats.goalsFor += match.homeScore;
    homeStats.goalsAgainst += match.awayScore;
    awayStats.goalsFor += match.awayScore;
    awayStats.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeStats.wins += 1;
      awayStats.losses += 1;
      homeStats.points += 3;
    } else if (match.homeScore < match.awayScore) {
      awayStats.wins += 1;
      homeStats.losses += 1;
      awayStats.points += 3;
    } else {
      homeStats.draws += 1;
      awayStats.draws += 1;
      homeStats.points += 1;
      awayStats.points += 1;
    }
  }

  const standings = Array.from(standingsMap.values()).map((team) => ({
    ...team,
    goalDifference: team.goalsFor - team.goalsAgainst,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  return standings;
}

function buildMatchdays(season: SeasonFile): Matchday[] {
  const teamNameById = new Map(season.teams.map((team) => [team.id, team.name]));
  const matchById = new Map(season.matches.map((match) => [match.id, match]));

  const providedMatchdays =
    season.matchdays?.map((day) => ({
      number: day.number,
      matchIds: day.matchIds.filter((id) => matchById.has(id)),
    })) ?? [];

  const isCompleteProvided =
    providedMatchdays.length > 0 &&
    providedMatchdays.reduce((total, day) => total + day.matchIds.length, 0) ===
      season.matches.length;

  const matchdayIdSets =
    isCompleteProvided && providedMatchdays.every((day) => day.matchIds.length)
      ? providedMatchdays
      : (() => {
          const sorted = [...season.matches].sort(
            (a, b) =>
              new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
          );

          const computed: { number: number; matchIds: string[] }[] = [];
          for (let i = 0; i < sorted.length; i += 9) {
            computed.push({
              number: computed.length + 1,
              matchIds: sorted.slice(i, i + 9).map((match) => match.id),
            });
          }

          return computed;
        })();

  return matchdayIdSets.map((day, index) => ({
    number: day.number ?? index + 1,
    matches: day.matchIds
      .map((matchId) => matchById.get(matchId))
      .filter((match): match is Match => Boolean(match))
      .map((match) => ({
        id: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeTeamName: teamNameById.get(match.homeTeamId) ?? "Equipe inconnue",
        awayTeamName: teamNameById.get(match.awayTeamId) ?? "Equipe inconnue",
        playedAt: match.playedAt,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      })),
  }));
}

const loadLigue1Standings = cache(async () => {
  const db = await readJsonFile<DbFile>(path.join(DATA_ROOT, "db.json"));
  const seasons = await Promise.all(
    db.seasonOrder.map(async (seasonId) => {
      const filePath = path.join(LIGUE1_SEASONS_DIR, `${seasonId}.json`);
      const season = await readJsonFile<SeasonFile>(filePath);
      return {
        id: season.id,
        name: season.name,
        standings: calculateStandings(season),
        matchdays: buildMatchdays(season),
      };
    }),
  );

  return seasons;
});

export async function getLigue1Standings(): Promise<SeasonStandings[]> {
  return loadLigue1Standings();
}
