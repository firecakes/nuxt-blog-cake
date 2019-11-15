const Joi = require("joi")
const Router = require("koa-router")
const router = new Router()
const path = require('path')
const validate = require("../../validate")

//go through the staging directory and retrieve all nested directories and files
router.get("/", async (ctx, next) => {
  let contents = await ctx.lib.recurseDirRead(ctx.config.stagingDir)
  if (!contents) { //there is no staging directory
    contents = [];
  }
  ctx.body = {
    contents: filterTopLevel(contents)
  }
})

const linkPostSchema = Joi.object().keys({
  directory: Joi.string().required(),
  entry: Joi.string().required(),
  preview: Joi.string().required(),
  title: Joi.string().allow(''),
  tags: Joi.array().items(
    Joi.string()
  ),
})

//move a post into live, and store metadata about it into the database
router.post("/link", validate(linkPostSchema), async (ctx, next) => {
  //add this content to the database
  const { directory, tags, preview, entry, title } = ctx.request.body

  //trim whitespace around the tags and title
  const trimmedTags = tags.map(t => t.trim())
  const trimmedTitle = title.trim()

  const {sql, sqlite} = ctx.lib
  //post creation
  await sqlite.run(sql.post.create({
    entry: entry,
    preview: preview,
    title: trimmedTitle,
    directory: directory,
  }))
  const postResult = await sqlite.get(sql.getLastInsert())
  const postId = postResult['last_insert_rowid()']
  //tag creation, if tags were specified
  if (trimmedTags.length !== 0) {
    await sqlite.run(sql.tag.create(trimmedTags))
    const tagResults = await sqlite.all(sql.tag.getByName(trimmedTags))
    //link tags to post
    await sqlite.run(sql.postTag.create(tagResults, postId))
  }

  const moveSuccess = await ctx.lib.moveDirectory(
    path.join(ctx.config.stagingDir, directory),
    path.join(ctx.config.liveDir, directory)
  )

  ctx.body = {
    success: moveSuccess
  }
})

const postTitleRenameSchema = Joi.object().keys({
  id: Joi.number().integer().required(),
  newTitle: Joi.string().allow('').required(),
})

//rename title of post
router.post("/rename", validate(postTitleRenameSchema), async (ctx, next) => {
  //add this to the database
  const { id, newTitle } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const updateResult = await sqlite.run(sql.post.updateByTitleName(id, newTitle)).catch(err => {
    //log any unexpected errors. unique constraint is expected
    if (err.code !== 'SQLITE_CONSTRAINT') { 
      console.log(err)
    }
    return false
  })

  if (!updateResult) {
    return ctx.body = {
      success: false
    }
  }

  ctx.body = {
    success: true
  }  
})

const unlinkDeleteSchema = Joi.object().keys({
  id: Joi.number().integer().required()
})

//move a post from live to staging, and delete relevant info from the database
router.delete("/link", validate(unlinkDeleteSchema), async (ctx, next) => {
  //delete the post, post tag relationships, and collection items matching the post id
  const { id } = ctx.request.body
  const {sql, sqlite} = ctx.lib
  //get the location of the post
  const { directory } = await sqlite.get(sql.post.getById(id))

  await sqlite.run(sql.collectionItem.deleteByPostId(id))
  await sqlite.run(sql.postTag.deleteByPostId(id))
  await sqlite.run(sql.post.deleteById(id))

  const moveSuccess = await ctx.lib.moveDirectory(
    path.join(ctx.config.liveDir, directory),
    path.join(ctx.config.stagingDir, directory)
  )

  ctx.body = {
    success: moveSuccess
  }
})

//markdown conversion setup
const Showdown = require('showdown')
const filter = require('xss')
const converter = new Showdown.Converter({
    tables: true, //enable table rendering
})

const postMarkdownSchema = Joi.object().keys({
    title: Joi.string().regex(/^[A-z0-9-_]+$/, 'alphanumeric plus dash and underscore').required(),
    markdown: Joi.string().required(),
})

//creating a post from the UI via markdown
router.post('/markdown', validate(postMarkdownSchema), async (ctx, next) => {
    //sanitize the generated HTML output
    const html = converter.makeHtml(ctx.request.body.markdown)
    const sanitizedHtml = filter(html)

    await ctx.lib.writeHtml({
        title: ctx.request.body.title,
        html: sanitizedHtml
    })
    //done
    ctx.body = {
      success: true
    }
})

//removes non-directories from the output of recurseDirRead
function filterTopLevel (fileObj) {
  return fileObj.filter(f => f.contents !== false)
}

module.exports = router.routes()