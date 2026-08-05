import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { getPortfolioProject, portfolioProjects } from "../data";
import ImageGallery from "./ImageGallery";

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  return { title: project ? project.title : "Portfolio" };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-[#131314]">
      <header className="flex items-center justify-between px-6 py-3">
        <Link
          href="/portfolio"
          className="text-lg font-medium text-slate-800 dark:text-slate-100 tracking-tight hover:opacity-80"
        >
          ← Portfolio
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-4">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {project.role}
        </span>
        <h1 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {project.title}
        </h1>

        <div className="mt-6">
          <ImageGallery images={project.images} />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {project.summary}
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
