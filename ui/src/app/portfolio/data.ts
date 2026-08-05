export type PortfolioImage = {
  src: string;
  alt: string;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  role: string;
  summary: string;
  highlights: string[];
  images: PortfolioImage[];
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "rakamin",
    title: "Rakamin",
    role: "AI Application MVP",
    summary:
      "Built an AI application MVP for one of the big banks in Indonesia. The app's main function is to help the HC department manage job positions and organization structure with AI assistance.",
    highlights: [
      "Create and review job positions including their responsibility, output, GPI, and competency, with AI suggestions embedded.",
      "Create, modify, and analyze organization structure with the help of AI.",
    ],
    images: [
      { src: "/portofolio/rakamin/Rakamin-1.png", alt: "Rakamin project screenshot 1" },
      { src: "/portofolio/rakamin/Rakamin-2.png", alt: "Rakamin project screenshot 2" },
      { src: "/portofolio/rakamin/Rakamin-3.png", alt: "Rakamin project screenshot 3" },
    ],
  },
  {
    slug: "asj",
    title: "ASJ",
    role: "Backend Engineer",
    summary:
      "Built an end-to-end event management platform for a concert hall, covering seat reservation, ticket issuing, payment gateway integration, and reporting for admins. Handled mostly the backend side using Next.js and Prisma.",
    highlights: [
      "Seat reservation and ticket issuing flow.",
      "Payment gateway integration.",
      "Admin reporting.",
      "Backend built with Next.js and Prisma.",
    ],
    images: [
      { src: "/portofolio/asj/ajs-1.png", alt: "ASJ project screenshot 1" },
      { src: "/portofolio/asj/asj-2.png", alt: "ASJ project screenshot 2" },
      { src: "/portofolio/asj/asj-3.png", alt: "ASJ project screenshot 3" },
    ],
  },
];

export function getPortfolioProject(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}
