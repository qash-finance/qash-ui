// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const dotenv = require("dotenv"); // Import dotenv
dotenv.config(); // Load environment variables

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
// @ts-ignore
const config = {
  title: "Q3x | Docs",
  tagline: "Open-source toolkit for building dapps",
  favicon: "img/icon-starknet.svg",

  // Set the production url of your site here
  url: "https://q3x.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/docs/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "q3x-finance",
  projectName: "Q3x",

  scripts: [
    {
      src: "https://plausible.io/js/plausible.js",
      async: true,
      defer: true,
      "data-domain": "docs.q3x.io",
    },
  ],

  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
          // sidebarCollapsible: false,
          sidebarCollapsed: true,
          // Remove this to remove the "edit this page" links.
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      colorMode: {
        respectPrefersColorScheme: true,
      },
      image: "img/icon-starknet.svg",
      navbar: {
        title: "Q3x | Docs",
        logo: {
          alt: "q3x-logo",
          src: "img/logo-q3x.png",
        },
        items: [
          {
            href: "https://github.com/q3x-finance/docs",
            label: "GitHub Docs",
            position: "right",
          },
          {
            href: "https://q3x.io",
            label: "Website",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "GitHub",
            items: [
              {
                label: "Q3x GitHub",
                href: "https://github.com/q3x-finance",
              },
              {
                label: "Docs GitHub",
                href: "https://github.com/q3x-finance/docs",
              },
            ],
          },
          {
            title: "Social",
            items: [
              {
                label: "Twitter",
                href: "https://x.com/q3x_finance",
              },
              {
                label: "Telegram",
                href: "https://t.me/q3xfinance",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Q3x Docs. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      ...((process.env.ALGOLIA_SEARCH_ENABLED || "false") === "true"
        ? {
            algolia: {
              appId: process.env.ALGOLIA_APP_ID,
              apiKey: process.env.ALGOLIA_API_KEY,
              indexName: process.env.ALGOLIA_INDEX_NAME,
              contextualSearch: true,
              externalUrlRegex: "external\\.com|domain\\.com",
              replaceSearchResultPathname: {
                from: "/docs/",
                to: "/",
              },
              searchParameters: {},
              searchPagePath: "search",
              insights: false,
            },
          }
        : {}),
    }),
};

module.exports = config;
