"use client";

import { useRouter } from "next/navigation";

type Season = { id: string; name: string; teamId: string };

type Props = {
  teamId: string;
  seasons: Season[];
  selectedSeasonId: string;
};

export function TeamSeasonSelector({ teamId, seasons, selectedSeasonId }: Props) {
  const router = useRouter();

  return (
    <select
      value={selectedSeasonId}
      onChange={(event) => {
        const nextSeason = seasons.find((s) => s.id === event.target.value);
        const nextTeamId = nextSeason?.teamId ?? teamId;
        router.push(`/teams/${nextTeamId}?season=${event.target.value}`);
      }}
      className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white outline-none transition focus:border-indigo-300 sm:w-64"
    >
      {seasons.map((season) => (
        <option key={season.id} value={season.id}>
          {season.name}
        </option>
      ))}
    </select>
  );
}
