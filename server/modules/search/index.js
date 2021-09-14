const Joi = require("joi")
const Router = require("koa-router")
const router = new Router()
const luxon = require("luxon")
const validate = require("../../validate")

const postGetSchema = Joi.object().keys({
  collection: Joi.string().allow(''),
  tag: Joi.string().allow(''),
  page: Joi.number().integer().greater(0).default(1),
})

//get a sample of posts, with searchable inputs and tag and collection information
router.get("/post", validate(postGetSchema, 'query'), async (ctx, next) => {
  const {sql, sqlite} = ctx.lib
  let { page, tag, collection } = ctx.request.query
  const queryLimit = ctx.config.queryLimit
  const offset = page * queryLimit - queryLimit

  //NOTE: query for one more entry than necessary, so we know whether we reached the end of the posts
  let posts = []
  if (tag === undefined && collection === undefined) { //no filter
    posts = await sqlite.all(sql.post.get() + sql.orderPosts() + sql.addFilter(queryLimit + 1, offset))
  }
  else if (tag !== undefined && collection === undefined) { //filter for tag only
    posts = await sqlite.all(sql.post.getByTagName(tag) + sql.orderPosts() + sql.addFilter(queryLimit + 1, offset))
  }
  else if (tag === undefined && collection !== undefined) { //filter for collection only. sort by order_number
    posts = await sqlite.all(sql.post.getByCollectionName(collection) + sql.orderCollection() + sql.addFilter(queryLimit + 1, offset))
  }
  else if (tag !== undefined && collection !== undefined) { //perform exact matches for tag and collection input
    posts = await sqlite.all(sql.post.getByTagAndCollectionName(tag, collection) + sql.orderCollection() + sql.addFilter(queryLimit + 1, offset))
  }

  const enrichedPostInfo = await attachTagsAndCollectionInfo(posts, ctx.lib, collection)

  ctx.body = {
    success: true,
    end: posts.length < queryLimit + 1,
    posts: enrichedPostInfo.slice(0, queryLimit)
  }
})

//get all posts, their tag information, and which collections they're a part of
router.get("/post/all", async (ctx, next) => {
  const {sql, sqlite} = ctx.lib
  const posts = await sqlite.all(sql.post.get())
  
  const enrichedPostInfo = await attachTagsAndCollectionInfo(posts, ctx.lib)

  ctx.body = {
    success: true,
    posts: enrichedPostInfo
  }
})

//get all posts, but without extra tag or collection information
router.get("/post/index", async (ctx, next) => {
  const {sql, sqlite} = ctx.lib
  let posts = await sqlite.all(sql.post.get())
  ctx.body = {
    success: true,
    posts: posts.map(post => {
      return Object.assign({
        //human friendly date
        timestamp_human: luxon.DateTime.fromISO(post.timestamp_iso).toFormat('LLL dd, yyyy')
      }, post)
    })
  }
})

//query all tags created
router.get("/tag", async (ctx, next) => {
  const {sql, sqlite} = ctx.lib
  const tags = await sqlite.all(sql.tag.get())
  ctx.body = {
    success: true,
    tags: tags.map(t => t.name) //only names
  }  
})

//query all collections created
router.get("/collection", async (ctx, next) => {
  const {sql, sqlite} = ctx.lib
  const collections = await sqlite.all(sql.collection.get())
  const collectionsItems = await sqlite.all(sql.collectionItem.getWithPost())

  //attach the items to the collection names
  const collectionsHashedById = {}
  for (let i = 0; i < collections.length; i++) {
    collectionsHashedById[collections[i].id] = collections[i]
    collectionsHashedById[collections[i].id].items = []
  }

  //attach the items to the collections
  for (let i = 0; i < collectionsItems.length; i++) {
    const item = collectionsItems[i]
    collectionsHashedById[item.collection_id].items.push(item)
  }

  const transformedCollections = []

  for (let id in collectionsHashedById) {
    const coll = collectionsHashedById[id]
    transformedCollections.push({
      id: coll.id,
      name: coll.name,
      //have an integer representation of the iso timestamp for sorting
      timestamp_epoch: luxon.DateTime.fromISO(coll.timestamp_iso).toMillis(),
      items: coll.items.map(i => {
        return {
          entry: i.entry,
          preview: i.preview,
          title: i.title,
        }
      })
    })
  }

  ctx.body = {
    success: true,
    collections: transformedCollections
  }  
})

// helper function that attaches tag and collection information, as well as readable dates
async function attachTagsAndCollectionInfo (posts, lib, collection) {
  const {sql, sqlite} = lib

  const postTags = await sqlite.all(sql.postTag.getWithTagName())
  const collectionItems = await sqlite.all(sql.collectionItem.getWithName())
  const collectionItemsTransformed = collectionItems.map(ci => {
    return {
      id: ci.id,
      name: ci.name,
      order_number: ci.order_number,
      post_id: ci.post_id,
      timestamp_iso: ci.timestamp_iso,
    }
  })
  const postsHashedById = {}
  for (let i = 0; i < posts.length; i++) {
    postsHashedById[posts[i].id] = posts[i]
    postsHashedById[posts[i].id].tags = []
    postsHashedById[posts[i].id].collections = []
  }
  //attach the tags and collections to the posts
  for (let i = 0; i < postTags.length; i++) {
    if (!postsHashedById[postTags[i].post_id]) {
      continue; // found a post tag not in posts. probably outside the search boundaries
    }
    postsHashedById[postTags[i].post_id].tags.push(postTags[i].name)
  }
  for (let i = 0; i < collectionItemsTransformed.length; i++) {
    if (!postsHashedById[collectionItemsTransformed[i].post_id]) {
      continue; // found a collection item not in posts. probably outside the search boundaries
    }
    postsHashedById[collectionItemsTransformed[i].post_id].collections.push(collectionItemsTransformed[i])
  }

  const transformedPosts = []

  for (let id in postsHashedById) {
    const post = postsHashedById[id]
    transformedPosts.push({
      id: post.id,
      entry: post.entry,
      preview: post.preview,
      timestamp_iso: post.timestamp_iso,
      title: post.title,
      directory: post.directory,
      tags: post.tags,
      collections: post.collections,
      order_number: post.order_number,
      //have an integer representation of the iso timestamp for sorting
      timestamp_epoch: luxon.DateTime.fromISO(post.timestamp_iso).toMillis(),
      //human friendly date
      timestamp_human: luxon.DateTime.fromISO(post.timestamp_iso).toFormat('LLL dd, yyyy')
    })
  }

  // sort by time posted or by order_number, if collection is specified
  return (collection !== undefined) ? transformedPosts.sort((a, b) => a.order_number - b.order_number)
    : transformedPosts.sort((a, b) => b.timestamp_epoch - a.timestamp_epoch)
}

module.exports = router.routes()