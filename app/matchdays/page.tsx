import { Matchdays } from "../components/Matchdays";
import { getLigue1Standings } from "@/lib/ligue1";

export const revalidate = 3600;

export default async function MatchdaysPage() {
  const seasons = await getLigue1Standings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-12 text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-8">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">
            Calendrier
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Matchdays Ligue 1
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Consultez chaque journee, ses affiches et les scores. Selectionnez une saison et la
            journee qui vous interesse.
          </p>
        </header>

        <Matchdays seasons={seasons} />
      </main>
    </div>
  );
}
