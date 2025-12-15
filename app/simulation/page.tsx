import type { Metadata } from "next";

import {
  getLigue1SimulationSeasons,
  getLigue1Teams,
} from "@/lib/ligue1";
import { SimulationClient } from "./SimulationClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Simulation pari favori",
  description:
    "Simulez une mise fixe sur le favori de chaque match d'un club et visualisez les gains/pertes cumulés.",
  alternates: {
    canonical: "/simulation",
  },
  openGraph: {
    title: "Simulation pari favori",
    description:
      "Projetez vos gains ou pertes en misant systématiquement sur le favori des matchs d'une équipe.",
    url: "/simulation",
  },
};

export default async function SimulationPage() {
  const [teams, seasons] = await Promise.all([
    getLigue1Teams(),
    getLigue1SimulationSeasons(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-12 text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-8">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">
            Simulation
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Miser sur le favori
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Choisissez une mise et un club. Nous rejouons toutes les saisons disponibles en pariant
            systématiquement sur l&apos;équipe favorite de chaque match et nous traçons les gains ou
            pertes cumulés dans le temps.
          </p>
        </header>

        <SimulationClient teams={teams} seasons={seasons} />
      </main>
    </div>
  );
}
