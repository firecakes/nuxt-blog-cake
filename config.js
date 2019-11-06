const path = require('path')

//change these variables only if you know what you're doing! you will have to restructure your existing posts to follow suit
//unfortunately, due to how webpack does its weird compilation process, you will have to manually edit some paths yourself
//go to these files and perform similar replacements: pages/index.vue, pages/archive.vue, components/admin/PublishPost.vue 
const stagingPrefix = "pages/staging" //where all the posts that aren't live go
const stagingRoutePrefix = "staging" //the link needed to get to this content
const livePrefix = "pages/post" //where all the posts that are live go
const liveRoutePrefix = "post" //the link needed to get to this content

const config = {
    port: process.env.PORT || 3000, //the port this server runs on
    baseDir: __dirname,
    stagingPrefix: stagingPrefix,
    livePrefix: livePrefix,
    stagingRoutePrefix: stagingRoutePrefix,
    liveRoutePrefix: liveRoutePrefix,
    stagingDir: path.resolve(__dirname, stagingPrefix),
    liveDir: path.resolve(__dirname, livePrefix),
    adminAccess: process.env.ADMIN_ACCESS || false, //if true, allows extra pages to be exposed for managing posts and other things
    queryLimit: process.env.QUERY_LIMIT || 20, //how many posts a user can view on the website at one time
    isSecure: process.env.IS_SECURE || false, //if true, HTTPS. if false, HTTP
    pageTitle: process.env.PAGE_TITLE, //the title of the website that shows up in a browser tab
    logFile: process.env.LOG_FILE, //access to pages will be logged if this is set, saved as the same name in the root directory
    external: {
        proxyPort: process.env.PROXY_PORT, //the port for the proxy that sits in front of this server (ex. haproxy)
        //the address for axios to know how to make requests to the server from your browser. excludes port if it's already 80
        //domainAddress: (see below). requires DOMAIN_NAME to be defined
    },
    feed: {
        authorName: process.env.AUTHOR_NAME || "", //your name for credit in the feed file
        email: process.env.EMAIL || "", //your email for contact in the feed file
        title: process.env.FEED_TITLE || "My Blog Feed" //the title of your feed   
        //the address your website runs on. this is how feeds generate external links to your content
        //websiteString: (see below)
    }
}

//coercion to numbers and booleans
if (config.port !== undefined) config.port = Number(config.port)
if (config.queryLimit !== undefined) config.queryLimit = Number(config.queryLimit)
if (config.external.proxyPort !== undefined) config.external.proxyPort = Number(config.external.proxyPort)

if (config.adminAccess === "false") config.adminAccess = false
if (config.adminAccess === "true") config.adminAccess = true

if (config.isSecure === "false") config.isSecure = false
if (config.isSecure === "true") config.isSecure = true

const proxyPortString = (config.external.proxyPort === 80 || config.external.proxyPort === undefined) ? "" : (":" + config.external.proxyPort)
const protocol = config.isSecure ? 'https' : 'http'
const fullAddress = `${protocol}://${process.env.DOMAIN_NAME}` + proxyPortString

if (process.env.DOMAIN_NAME) {
    config.feed.websiteString = fullAddress 
}
else {
    config.feed.websiteString = 'http://localhost:' + config.port //default
}

if (process.env.DOMAIN_NAME) {
    config.external.domainAddress = fullAddress
}

module.exports = config