import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/app/portfolio/data";

type PortfolioCardProps = {
  project: PortfolioProject;
};

export default function PortfolioCard({ project }: PortfolioCardProps) {
  const coverImage = project.images[0];

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-[#28292a] bg-white dark:bg-[#1e1f20] transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-[#28292a]">
        {coverImage && (
          <Image
            src={coverImage.src}
            alt={coverImage.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {project.role}
        </span>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {project.title}
        </h2>
        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
          {project.summary}
        </p>
      </div>
    </Link>
  );
}
