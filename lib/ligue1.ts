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

export type TeamProfile = {
  teamId: string;
  teamName: string;
  seasons: { id: string; name: string; teamId: string }[];
  latestSeasonId: string;
};

export type TeamSeasonMatch = {
  id: string;
  seasonId: string;
  seasonName: string;
  playedAt: string;
  isHome: boolean;
  opponentId: string;
  opponentName: string;
  goalsFor: number;
  goalsAgainst: number;
  result: "V" | "N" | "D";
};

export type TeamSeasonData = {
  seasonId: string;
  seasonName: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsForAvg: number;
  goalsAgainstAvg: number;
  points: number;
  totals: { line: number; over: number; under: number }[];
  longestWinStreak: number;
  longestDrawStreak: number;
  longestLossStreak: number;
  goalsHome: { max: number; min: number; avg: number };
  goalsAway: { max: number; min: number; avg: number };
  matches: TeamSeasonMatch[];
};

export type TeamInfo = {
  teamId: string;
  name: string;
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

export async function getLigue1Teams(): Promise<TeamInfo[]> {
  const db = await readJsonFile<DbFile>(path.join(DATA_ROOT, "db.json"));
  const teamByName = new Map<string, TeamInfo>();

  for (const seasonId of db.seasonOrder) {
    const filePath = path.join(LIGUE1_SEASONS_DIR, `${seasonId}.json`);
    const season = await readJsonFile<SeasonFile>(filePath);
    for (const team of season.teams) {
      if (!teamByName.has(team.name)) {
        teamByName.set(team.name, { teamId: team.id, name: team.name });
      }
    }
  }

  return Array.from(teamByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function getLigue1TeamProfile(
  teamId: string,
): Promise<TeamProfile | null> {
  const db = await readJsonFile<DbFile>(path.join(DATA_ROOT, "db.json"));

  // First pass: find the reference team name by id in any season.
  let referenceName: string | null = null;
  const seasonsCache = new Map<string, SeasonFile>();
  for (const seasonId of db.seasonOrder) {
    const filePath = path.join(LIGUE1_SEASONS_DIR, `${seasonId}.json`);
    const season = await readJsonFile<SeasonFile>(filePath);
    seasonsCache.set(seasonId, season);

    const matchById = season.teams.find((t) => t.id === teamId);
    if (matchById) {
      referenceName = matchById.name;
    }
  }

  if (!referenceName) {
    return null;
  }

  // Second pass: collect all seasons where the same name appears.
  const seasonsForTeam: { id: string; name: string; teamId: string; teamName: string }[] =
    [];
  for (const seasonId of db.seasonOrder) {
    const season = seasonsCache.get(seasonId)!;
    const matchByName = season.teams.find(
      (t) => t.name.toLowerCase() === referenceName.toLowerCase(),
    );
    if (matchByName) {
      seasonsForTeam.push({
        id: season.id,
        name: season.name,
        teamId: matchByName.id,
        teamName: matchByName.name,
      });
    }
  }

  if (seasonsForTeam.length === 0) return null;

  const latest = seasonsForTeam[0];
  return {
    teamId: latest.teamId,
    teamName: referenceName,
    seasons: seasonsForTeam,
    latestSeasonId: latest.id,
  };
}

export async function getLigue1TeamSeasonData(
  teamId: string,
  seasonId: string,
): Promise<TeamSeasonData | null> {
  const seasonPath = path.join(LIGUE1_SEASONS_DIR, `${seasonId}.json`);
  const season = await readJsonFile<SeasonFile>(seasonPath);

  const team = season.teams.find((t) => t.id === teamId);
  if (!team) return null;

  const teamNameById = new Map(season.teams.map((t) => [t.id, t.name]));

  const matches = season.matches
    .filter(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
    )
    .sort(
      (a, b) =>
        new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
    )
    .map((match) => {
      const isHome = match.homeTeamId === teamId;
      const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
      const goalsFor = isHome ? match.homeScore : match.awayScore;
      const goalsAgainst = isHome ? match.awayScore : match.homeScore;
      let result: "V" | "N" | "D" = "N";
      if (goalsFor > goalsAgainst) result = "V";
      else if (goalsFor < goalsAgainst) result = "D";

      return {
        id: match.id,
        seasonId: season.id,
        seasonName: season.name,
        playedAt: match.playedAt,
        isHome,
        opponentId,
        opponentName: teamNameById.get(opponentId) ?? "Equipe inconnue",
        goalsFor,
        goalsAgainst,
        result,
      } satisfies TeamSeasonMatch;
    });

  const wins = matches.filter((m) => m.result === "V").length;
  const draws = matches.filter((m) => m.result === "N").length;
  const losses = matches.filter((m) => m.result === "D").length;
  const goalsFor = matches.reduce((acc, m) => acc + m.goalsFor, 0);
  const goalsAgainst = matches.reduce((acc, m) => acc + m.goalsAgainst, 0);
  const matchCount = matches.length || 1;
  const goalsForAvg = goalsFor / matchCount;
  const goalsAgainstAvg = goalsAgainst / matchCount;
  const points = wins * 3 + draws;

  const TOTAL_LINES = [0.5, 1.5, 2.5, 3.5];
  const totals = TOTAL_LINES.map((line) => {
    const over = matches.filter(
      (m) => m.goalsFor + m.goalsAgainst > line,
    ).length;
    const under = matches.length - over;
    return { line, over, under };
  });

  const computeLongestStreak = (target: "V" | "N" | "D") => {
    let best = 0;
    let current = 0;
    for (const m of matches) {
      if (m.result === target) {
        current += 1;
        if (current > best) best = current;
      } else {
        current = 0;
      }
    }
    return best;
  };

  const longestWinStreak = computeLongestStreak("V");
  const longestDrawStreak = computeLongestStreak("N");
  const longestLossStreak = computeLongestStreak("D");

  const homeGoals = matches.filter((m) => m.isHome).map((m) => m.goalsFor);
  const awayGoals = matches.filter((m) => !m.isHome).map((m) => m.goalsFor);
  const calcGoalsStats = (arr: number[]) => {
    if (arr.length === 0) return { max: 0, min: 0, avg: 0 };
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return { max, min, avg };
  };
  const goalsHome = calcGoalsStats(homeGoals);
  const goalsAway = calcGoalsStats(awayGoals);

  return {
    seasonId: season.id,
    seasonName: season.name,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalsForAvg,
    goalsAgainstAvg,
    points,
    totals,
    longestWinStreak,
    longestDrawStreak,
    longestLossStreak,
    goalsHome,
    goalsAway,
    matches,
  };
}
