require('dotenv').config()
const config = require('./config')
const pkg = require('./package')

const axiosConfig = {}
// override how axios requests the server if proxy port is enabled
if (config.external.domainAddress) {
  axiosConfig.baseURL = config.external.domainAddress
}

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: config.pageTitle ? config.pageTitle : pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'alternate', type: 'application/rss+xml', href: config.feed.websiteString + "/feeds/rss" },
      { rel: 'alternate', type: 'application/atom+xml', href: config.feed.websiteString + "/feeds/atom" },
    ]
  },

  //envs are accessible to the front-end
  env: {
    config: config,
    websiteString: config.feed.websiteString
  }, 

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/css/pure.css'
  ],

  serverMiddleware: ['~/server/index'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: axiosConfig,

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend (config) {
      config.module.rules.push({ // "handle" vue files with feed blocks in them to avoid compilation errors
        resourceQuery: /blockType=feed/,
        loader: require.resolve("./feed-loader.js"),
      });
      console.log(config.module.rules)
    }
  }
}
