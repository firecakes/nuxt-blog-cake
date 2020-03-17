const config = require('../config')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const utils = require('./utils')
const auth = require('./auth')
const path = require('path')
const apiRouter = new Router({ //all routes here prefixed with /api/
  prefix: '/api/'
})

module.exports = async app => {
  //start the database
  await utils.dbInit()
      .catch(err => console.error(err.stack))
        
  app.use(bodyParser())
  app.use(async (ctx, next) => { //attach utils and env vars to the context
    ctx.lib = utils
    ctx.config = config
    await next()
  })
  app.use(auth) //prevents certain routes from being accessible

  if (config.logFile) { //writes request information to a file if enabled
    const stream = await utils.writeStream(config.logFile)
    app.use(log(stream))
  }

  //recursively go through directories in modules and load their contents, binding the route to the folder structure
  //ex. the route at data/testing/index.js is loaded under the API /api/data/testing/

  const modulesDir = path.resolve(config.baseDir, "server/modules")
  const moduleInfo = await utils.recurseDirRead(modulesDir)

  loadMiddlewareInDirectory(apiRouter, moduleInfo, "", modulesDir)

  app
    .use(apiRouter.routes()) //allow parent module to specify catch-all routes
}

function loadMiddlewareInDirectory (router, directoryInfo, pathName, baseDir) {
  for (let i = 0; i < directoryInfo.length; i++) {
    const relativeModuleName = pathName + directoryInfo[i].name + "/"
    const absoluteModuleName = path.resolve(baseDir, relativeModuleName)
    if (directoryInfo[i].contents) {
      loadMiddlewareInDirectory(router, directoryInfo[i].contents, relativeModuleName, baseDir)
    }
    else {
      //remove the /index.js part of the path
      const modulePath = relativeModuleName.split("/index.js/").slice(0, -1).join()
      router.use(modulePath, require(absoluteModuleName))
    }
  }
}

//middleware to log website visits

function log (stream) {
  return async function log (ctx, next) {
    const start = Date.now()
    await next()
    const ms = Date.now() - start

    //ignore certain routes being logged
    if (ctx.url.startsWith('/_nuxt') || ctx.url.startsWith('/__webpack') || ctx.url.startsWith('/api')) {
      return
    }

    const data = {
      method: ctx.method,
      url: ctx.url,
      origin: ctx.origin,
      query: ctx.query,
      ip: ctx.ip,
      responseTime: ms,
      date: start
    }

    stream.write(JSON.stringify(data) + "\n", () => {})
  }
}

