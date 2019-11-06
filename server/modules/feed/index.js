const Joi = require("joi")
const path = require("path")
const Router = require("koa-router")
const router = new Router()

//returns all feed locations found on the server
router.get("/", async (ctx, next) => {
  //search under static/feeds/
  const dir = await ctx.lib.recurseDirRead('./static/feeds/')

  const feeds = []
  directoryToFeeds(dir, feeds, "feeds")

  const fullLinks = feeds.map(f => {
    return `${ctx.config.feed.websiteString}/${f}`
  })

  ctx.body = {
    success: true,
    feeds: fullLinks
  }
})

//does BFS instead of DFS
function directoryToFeeds (arr, feeds, path) {
  const recurseDirs = []

  for (let i in arr) {
    if (arr[i].contents) { //recurse
      recurseDirs.push(directoryToFeeds.bind(null, arr[i].contents, feeds, path + "/" + arr[i].name))
    }
    else { //leaf found
      feeds.push(path + "/" + arr[i].name)
    }
  }

  for (let i in recurseDirs) {
    recurseDirs[i]()
  }
}

module.exports = router.routes()