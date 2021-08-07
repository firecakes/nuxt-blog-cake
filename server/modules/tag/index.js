const Joi = require("joi")
const Router = require("koa-router")
const router = new Router()
const validate = require("../../validate")

const tagPostSchema = Joi.object().keys({
  name: Joi.string().required(),
})

//create a new tag
router.post("/", validate(tagPostSchema), async (ctx, next) => {
  //add this to the database
  const { name } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const createResult = await sqlite.run(sql.tag.create([name])).catch(err => {
    //log any unexpected errors. unique constraint is expected
    if (err.code !== 'SQLITE_CONSTRAINT') { 
      console.log(err)
    }
    return false
  }) 

  if (!createResult) {
    return ctx.body = {
      success: false
    }
  }

  ctx.body = {
    success: true
  }  
})

const tagPostRenameSchema = Joi.object().keys({
  oldName: Joi.string().required(),
  newName: Joi.string().required(),
})

//rename tag
router.post("/rename", validate(tagPostRenameSchema), async (ctx, next) => {
  //add this to the database
  const { oldName, newName } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const updateResult = await sqlite.run(sql.tag.updateByName(oldName, newName)).catch(err => {
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

//delete a tag
router.delete("/", validate(tagPostSchema), async (ctx, next) => {
  //delete tag and related post_tags from the database
  const { name } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const tag = await sqlite.get(sql.tag.getByName(name))
  await sqlite.run(sql.postTag.deleteByTagId(tag.id))
  await sqlite.run(sql.tag.deleteByName(name))

  ctx.body = {
    success: true
  }
})

const tagPostPostSchema = Joi.object().keys({
  tagName: Joi.string().required(),
  postId: Joi.number().integer().required(),
})

//add a tag to a post
router.post("/post", validate(tagPostPostSchema), async (ctx, next) => {
  //add this to the database
  const { tagName, postId } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const tag = await sqlite.get(sql.tag.getByName(tagName))

  const createResult = await sqlite.run(sql.postTag.create([tag], postId)).catch(err => {
    //log any unexpected errors. unique constraint is expected
    if (err.code !== 'SQLITE_CONSTRAINT') { 
      console.log(err)
    }
    return false
  }) 

  if (!createResult) {
    return ctx.body = {
      success: false
    }
  }

  ctx.body = {
    success: true
  }
})

//delete a tag from a post
router.delete("/post", async (ctx, next) => {
  //delete this from the database
  const { tagName, postId } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const tag = await sqlite.get(sql.tag.getByName(tagName))
  await sqlite.run(sql.postTag.deleteByTagIdAndPostId(tag.id, postId))

  ctx.body = {
    success: true
  }

})


module.exports = router.routes()