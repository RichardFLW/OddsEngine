import { getLigue1Standings } from "@/lib/ligue1";
import { Ligue1Standings } from "./components/Ligue1Standings";

export const revalidate = 3600;

export default async function Home() {
  const seasons = await getLigue1Standings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-12 text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-8">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">
            Tableau officiel
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Classement Ligue 1 Uber Eats
          </h1>
          <p className="max-w-2xl text-base text-zinc-400">
            Les donnees sont chargees depuis les fichiers JSON locaux afin de
            reconstituer le classement. Choisissez la saison a visualiser pour
            consulter le tableau correspondant (tri sur points, difference de
            buts puis buts marques).
          </p>
        </header>

        <Ligue1Standings seasons={seasons} />
      </main>
    </div>
  );
}
