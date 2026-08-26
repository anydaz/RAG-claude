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
    role: "Fullstack Engineer",
    summary:
      "Built an AI application MVP for one of the big banks in Indonesia. The app's main function is to help the HC department manage job positions and organization structure with AI assistance.",
    highlights: [
      "Create and review job positions including their responsibility, output, GPI, and competency, with AI suggestions embedded.",
      "Create, modify, and analyze organization structure with the help of AI.",
    ],
    images: [
      {
        src: "/portofolio/rakamin/Rakamin-1.png",
        alt: "Rakamin project screenshot 1",
      },
      {
        src: "/portofolio/rakamin/Rakamin-2.png",
        alt: "Rakamin project screenshot 2",
      },
      {
        src: "/portofolio/rakamin/Rakamin-3.png",
        alt: "Rakamin project screenshot 3",
      },
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
  {
    slug: "legend-ai",
    title: "Legend AI",
    role: "Frontend Engineer",
    summary:
      "Built a form heavy application with customizeable dashboard and chatbot integration.",
    highlights: [
      "Built multistep and conditional forms.",
      "MCP integration.",
      "Chatbot integration.",
    ],
    images: [
      {
        src: "/portofolio/LegendAI/LegendAI-01.png",
        alt: "Legend AI screenshot 1",
      },
      {
        src: "/portofolio/LegendAI/LegendAI-02.png",
        alt: "Legend AI screenshot 2",
      },
    ],
  },
  {
    slug: "happy5-app",
    title: "Happy5 App",
    role: "Engineering Manager",
    summary:
      "Lead a frontend team and collaborate with other teams to develop multiple features for Employee Performance Management SAAS application.",
    highlights: [
      "Contribute to build the foundation of peformance review module.",
      "Complex Dashboard and Analytics.",
      "Contribute to mobile tech stack migration from Swift to React Native.",
    ],
    images: [
      {
        src: "/portofolio/happy5-app/Happy5-01.png",
        alt: "Happy5 screenshot 1",
      },
      {
        src: "/portofolio/happy5-app/Happy5-02.png",
        alt: "Happy5 screenshot 2",
      },
      {
        src: "/portofolio/happy5-app/Happy5-03.png",
        alt: "Happy5 screenshot 3",
      },
      {
        src: "/portofolio/happy5-app/Happy5-04.png",
        alt: "Happy5 screenshot 4",
      },
      {
        src: "/portofolio/happy5-app/Happy5-05.png",
        alt: "Happy5 screenshot 5",
      },
      {
        src: "/portofolio/happy5-app/Happy5-06.png",
        alt: "Happy5 screenshot 6",
      },
      {
        src: "/portofolio/happy5-app/Happy5-07.png",
        alt: "Happy5 screenshot 7",
      },
    ],
  },
  {
    slug: "happy5-web",
    title: "Happy5 Web",
    role: "Frontend Engineer",
    summary:
      "Built Happy5 company profile website using Next.js and Strapi (Headless CMS).",
    highlights: [
      "Collaborate with design and marketing teams.",
      "Integrate headless CMS",
    ],
    images: [
      {
        src: "/portofolio/happy5-web/H5Web-01.png",
        alt: "Happy5 Web screenshot 1",
      },
      {
        src: "/portofolio/happy5-web/H5Web-02.png",
        alt: "Happy5 Web screenshot 2",
      },
      {
        src: "/portofolio/happy5-web/H5Web-03.png",
        alt: "Happy5 Web screenshot 3",
      },
    ],
  },
  {
    slug: "personal-rag",
    title: "Personal RAG Application",
    role: "Fullstack Engineer",
    summary:
      "Built a personal RAG assistant to answers professional inquiries and showcase portofolios.",
    highlights: ["Develop RAG Pipelines using Langgraph"],
    images: [
      {
        src: "/portofolio/personal-rag/rag-1.png",
        alt: "Personal RAG screenshot 1",
      },
      {
        src: "/portofolio/personal-rag/rag-2.png",
        alt: "Personal RAG screenshot 2",
      },
    ],
  },
  {
    slug: "sistem-toko",
    title: "SME's Store Management System",
    role: "Fullstack Engineer",
    summary:
      "Built an ERP like system that contain several module like purchasing, sales, inventory, and reporting for SME's",
    highlights: ["built an erp like system using Laravel"],
    images: [
      {
        src: "/portofolio/sistem-toko/sistem-toko-1.png",
        alt: "Sistem Toko screenshot 1",
      },
      {
        src: "/portofolio/sistem-toko/sistem-toko-2.png",
        alt: "Sistem Toko screenshot 1",
      },
    ],
  },
];

export function getPortfolioProject(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}
