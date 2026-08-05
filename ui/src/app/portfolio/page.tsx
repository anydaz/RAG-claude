import Link from "next/link";
import PortfolioCard from "@/components/PortfolioCard";
import ThemeToggle from "@/components/ThemeToggle";
import { portfolioProjects } from "./data";

export const metadata = {
  title: "Portfolio",
  description: "A selection of projects I've worked on",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-[#131314]">
      <header className="flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-lg font-medium text-slate-800 dark:text-slate-100 tracking-tight hover:opacity-80"
        >
          ← Back
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16 pt-4">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Portfolio
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          A selection of projects I&apos;ve worked on.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {portfolioProjects.map((project) => (
            <PortfolioCard key={project.slug} project={project} />
          ))}
        </div>
      </main>
    </div>
  );
}
