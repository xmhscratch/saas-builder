import { fileURLToPath } from 'url';
import tailwindConfig from './tailwind.config'

const nuxtSrcDir = fileURLToPath(new URL('./.nuxt', import.meta.url))

export default {
  compatibilityDate: '2024-11-01',
  devServer: {
    host: '0.0.0.0',
    url: 'http://0.0.0.0:3000'
  },
  devtools: { enabled: true },
  alias: {
    '~': fileURLToPath(new URL('./', import.meta.url)),
    'lib': `${nuxtSrcDir}/shadcn-nuxt`,
    'components': fileURLToPath(new URL('./assets/components', import.meta.url)),
  },
  // imports: {
  //   dirs: [`${nuxtSrcDir}/lib`]
  // },
  app: {
    cdnURL: 'https://cdn.dovaq.com'
  },
  dir: {
    public: fileURLToPath(new URL('./public', import.meta.url)),
    assets: fileURLToPath(new URL('./assets', import.meta.url)),
  },
  // css: [
  //   `~/assets/css/tailwind.css`,
  // ],
  ssr: false,
  // quiet: false,
  nitro: {
    experimental: {
      wasm: true
    }
  },
  modules: [
    "nuxt-security",
    "@nuxt/image",
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
  ],
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", "https:", "data:"]
      }
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: "last" }],
    configPath: 'tailwind.config',
    exposeConfig: false,
    viewer: false,
    config: tailwindConfig,
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: fileURLToPath(new URL('./assets/components/ui', import.meta.url)),
  }
}
