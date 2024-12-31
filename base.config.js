import { fileURLToPath } from 'url';
import tailwindConfig from './tailwind.config'

const nuxtSrcDir = fileURLToPath(new URL('./.nuxt', import.meta.url))

export default {
  compatibilityDate: '2024-11-01',
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
    cdnURL: 'http://localhost:3000/'
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
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
  ],
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
