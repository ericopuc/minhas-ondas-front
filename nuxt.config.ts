import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',

  // SPA: tudo roda no navegador (o Leaflet depende do DOM) e o build gera
  // arquivos estáticos servidos pelo nginx no container
  ssr: false,

  devtools: { enabled: false },

  css: ['leaflet/dist/leaflet.css', '~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // endereço da API principal; sobrescreva com NUXT_PUBLIC_API_URL
  runtimeConfig: {
    public: {
      apiUrl: 'http://127.0.0.1:5000',
    },
  },

  app: {
    head: {
      title: 'Minhas Ondas',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'description', content: 'Monitoramento das condições de surf dos seus picos favoritos' },
        { name: 'theme-color', content: '#050d1a' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },
});
