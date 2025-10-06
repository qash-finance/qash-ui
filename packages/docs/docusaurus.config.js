// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const dotenv = require("dotenv"); // Import dotenv
dotenv.config(); // Load environment variables

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
// @ts-ignore
const config = {
  title: "Qash | Docs",
  tagline: "Open-source toolkit for building dapps",
  favicon: "img/icon-starknet.svg",

  // Set the production url of your site here
  url: "https://app.qash.finance/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/docs/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "q3x-finance",
  projectName: "Qash",

  scripts: [
    {
      src: "https://plausible.io/js/plausible.js",
      async: true,
      defer: true,
      "data-domain": "docs.qash.finance",
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
        title: "Qash | Docs",
        logo: {
          alt: "q3x-logo",
          src: "img/logo-qash.png",
        },
        items: [
          {
            href: "https://qash.finance",
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
                label: "Qash GitHub",
                href: "https://github.com/qash-finance",
              },
            ],
          },
          {
            title: "Social",
            items: [
              {
                label: "Twitter",
                href: "https://x.com/qash_finance",
              },
              {
                label: "Telegram",
                href: "https://t.me/+GR5eFRAAoNAyMjZl",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Qash Docs. Built with Docusaurus.`,
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
