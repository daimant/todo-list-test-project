// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  nitro: {
    preset: 'node-server'
  },
  typescript: {
    typeCheck: true,
    strict: true
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables.scss" as *;'
        }
      }
    }
  },
  app: {
    head: {
      title: 'NoteFlow – Заметки и задачи',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1'
        },
        {
          name: 'description',
          content:
            'SPA приложение для заметок с todo-списками, сохранением в локальное хранилище и поддержкой undo/redo.'
        }
      ]
    }
  }
})

