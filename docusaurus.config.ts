import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'linked-faker',
  tagline: 'Relational fake data with valid foreign keys, from one schema',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://muzammil328.github.io',
  baseUrl: '/',

  organizationName: 'muzammil328',
  projectName: 'linked-faker',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/muzammil328/linked-faker/tree/main/linked-faker-docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'linked-faker',
      logo: {
        alt: 'linked-faker logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://www.npmjs.com/package/linked-faker',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/muzammil328/linked-faker',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started'},
            {label: 'Schema', to: '/docs/schema'},
            {label: 'API', to: '/docs/api'},
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/linked-faker',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/muzammil328/linked-faker',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Muzammal Safdar. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
