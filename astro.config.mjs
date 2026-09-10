// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { syncCourses } from './scripts/sync-courses.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://boards.ruyisdk.org',

  integrations: [
    {
      name: 'course-sources',
      hooks: {
        'astro:config:setup': async ({ command }) => {
          if (command === 'dev' || command === 'build') await syncCourses();
        },
      },
    },
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'zh-CN',
        locales: {
          'zh-CN': 'zh-CN',
          en: 'en-US',
        },
      },
    }),
  ],

  i18n: {
    locales: ['zh-CN', 'en'],
    defaultLocale: 'zh-CN',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      port: 3000,
      strictPort: true,
      host: true,
    },
  },
});
