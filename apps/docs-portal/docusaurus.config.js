/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Evenements Dev Portal",
  tagline: "Architecture, contrats, backlog et sprints dans un portail visuel unique.",
  url: "http://localhost",
  baseUrl: "/",
  onBrokenLinks: "throw",
  favicon: "data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27><rect rx=%2714%27 width=%2764%27 height=%2764%27 fill=%27%230f172a%27/><path d=%27M18 18h28v8H18zm0 14h20v8H18zm0 14h28v8H18z%27 fill=%27%23f8fafc%27/></svg>",
  organizationName: "mourad244",
  projectName: "evenements",
  deploymentBranch: "gh-pages",
  i18n: {
    defaultLocale: "fr",
    locales: ["fr"]
  },
  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        indexDocs: true,
        docsDir: ["../../docs"],
        indexBlog: false,
        blogDir: [],
        indexPages: true,
        docsRouteBasePath: ["reference"],
        hashed: true,
        explicitSearchResultPath: true,
        highlightSearchTermsOnTargetPage: true
      }
    ]
  ],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn"
    }
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "../../docs",
          routeBasePath: "reference",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/mourad244/evenements/tree/main/",
          breadcrumbs: true,
          showLastUpdateAuthor: false,
          showLastUpdateTime: false
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ],
  themeConfig: {
    image:
      "data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%271200%27 height=%27630%27><rect fill=%27%23f8fafc%27 width=%271200%27 height=%27630%27/><circle fill=%27%23dbeafe%27 cx=%27160%27 cy=%27120%27 r=%2790%27/><circle fill=%27%23fed7aa%27 cx=%271030%27 cy=%27110%27 r=%2780%27/><rect fill=%27%230f172a%27 x=%27105%27 y=%27155%27 rx=%2732%27 width=%27990%27 height=%27310%27/><text x=%27155%27 y=%27280%27 font-size=%2754%27 font-family=%27Space Grotesk, sans-serif%27 fill=%27white%27>Evenements Dev Portal</text><text x=%27155%27 y=%27340%27 font-size=%2728%27 font-family=%27Space Grotesk, sans-serif%27 fill=%27%23cbd5e1%27>Architecture, contrats, backlog et sprints</text></svg>",
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false
    },
    navbar: {
      title: "Evenements Portal",
      items: [
        { to: "/", label: "Accueil", position: "left" },
        { to: "/architecture", label: "Architecture", position: "left" },
        { to: "/api", label: "API", position: "left" },
        { to: "/backlogs", label: "Backlogs", position: "left" },
        { to: "/sprints", label: "Sprints", position: "left" },
        { to: "/services", label: "Services", position: "left" },
        { to: "/workflows", label: "Workflows", position: "left" },
        { to: "/ideas", label: "Ideas", position: "left" },
        { type: "docSidebar", sidebarId: "referenceSidebar", label: "Reference", position: "left" },
        {
          href: "https://github.com/mourad244/evenements",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Portail",
          items: [
            { label: "Accueil", to: "/" },
            { label: "Architecture", to: "/architecture" },
            { label: "API", to: "/api" }
          ]
        },
        {
          title: "Reference",
          items: [
            { label: "Documentation index", to: "/reference/navigation" },
            { label: "MVP scope", to: "/reference/mvp-scope" },
            { label: "Sprint 1 tracker", to: "/reference/sprints/sprint-1-tracker" }
          ]
        },
        {
          title: "Projet",
          items: [
            { label: "Repository", href: "https://github.com/mourad244/evenements" }
          ]
        }
      ]
    }
  }
};

module.exports = config;
