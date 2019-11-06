require('dotenv').config()
const config = require('./config')
const pkg = require('./package')

const axiosConfig = {}
// override how axios requests the server if proxy port is enabled
if (config.external.domainAddress) {
  axiosConfig.baseURL = config.external.domainAddress
}

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: config.pageTitle ? config.pageTitle : pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
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

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/pure.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*
  ** Axios module configuration
  */
  axios: axiosConfig, // See https://github.com/nuxt-community/axios-module#options
  
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      
    }
  }
}
