// a module that looks into the sqlite database and generates feed content based off the posts found

/* TAKEAWAYS
  Use description for summaries, and content for the entire post
  There is legacy stuff regarding the two above that makes things ambiguous. Just use description for now
  The image property doesn't work for feed items because a type isn't specified on generating the content for an enclosure tag.
    This is an issue with the feed module itself
  Using enclosure tags only allows one image per item, but you can add more than one image in a description tag
  Getting the full path of images under Nuxt requires a special path (see liveImageLocationUrl)
*/
require('dotenv').config()
const config = require('../config')

const db = require('sqlite')
const parser = require('parse5')
const Feed = require('feed').Feed
const sql = require('./utils/sql').sql

const promisify = require('util').promisify
const readFile = promisify(require('fs').readFile)
const writeFile = promisify(require('fs').writeFile)
const mkdirp = promisify(require('mkdirp'))
const rmdir = promisify(require('rimraf'))

const livePostLocationFs = config.livePrefix
const livePostLocationUrl = config.liveRoutePrefix
const liveImageLocationUrl = "_nuxt/" + config.livePrefix

const websiteString = `${config.feed.websiteString}`

async function init () {
  //wipe the feed folder first
  await rmdir("static/feeds")
  console.log("Generating feeds...")
  await dbInit()

  //generate feed of all live content first
  const posts = await db.all(sql.post.get())
  await generateFeed(posts, 'static/feeds')

  //generate a specific feed for every tag 
  const tags = await db.all(sql.tag.get())
  await Promise.all(tags.map(async tag => {
    const postsForTag = await db.all(sql.post.getByTagId(tag.id))
    await generateFeed(postsForTag, 'static/feeds/tag/' + tag.name)
  }))

  //generate a specific feed for every collection 
  const collections = await db.all(sql.collection.get())
  await Promise.all(collections.map(async collection => {
    const postsForCollection = await db.all(sql.post.getByCollectionName(collection.name))
    await generateFeed(postsForCollection, 'static/feeds/collection/' + collection.name)
  }))
  console.log("All feeds generated!")
}

async function generateFeed (posts, feedLocation) {
  const parsedFeedPosts = await Promise.all(posts.map(async post => {
    const file = (await readFile(`${livePostLocationFs}${post.entry}`)).toString()
    //parse the file for the feed tag and extract its value
    const parsed = parser.parseFragment(file.toString())
    const findFeed = parsed.childNodes.find(e => e.nodeName === "feed")
    let feedContent = undefined
    if (findFeed && findFeed.childNodes.length) {
      feedContent = findFeed.childNodes[0].value.trim()
    }
    return Object.assign(post, {
      feedContent: feedContent
      //image: parser.parse(file).image
    })
  }))

  //the base feed object
  const feed = new Feed({
    title: config.feed.title,
    description: "",
    id: websiteString,
    link: websiteString,
    favicon: websiteString + "/favicon.ico",
    updated: new Date(),
    feedLinks: {
      json: `${websiteString}/feeds/json`,
      atom: `${websiteString}/feeds/atom`,
      rss2: `${websiteString}/feeds/rss`,
    },
    author: {
      name: config.feed.authorName,
      email: config.feed.email,
    }
  })

  //add items to feed
  parsedFeedPosts.forEach(post => {
    feed.addItem({
      title: post.title,
      description: post.feedContent,
      date: new Date(post.timestamp_iso),
      link: `${websiteString}/${livePostLocationUrl}${post.directory}`,
    })
  })

  //output feeds as files and make them accessible
  await mkdirp(feedLocation)
  await writeFile(`${feedLocation}/rss`, feed.rss2())
  await writeFile(`${feedLocation}/atom`, feed.atom1())
  await writeFile(`${feedLocation}/json`, feed.json1())
}


async function dbInit () {
  return Promise.resolve()
    .then(() => db.open('./database.sqlite', { Promise }))
    .then(db => db.migrate())
}

init() //start it