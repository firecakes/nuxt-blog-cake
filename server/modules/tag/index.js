const Joi = require("joi")
const Router = require("koa-router")
const router = new Router()

const tagPostSchema = Joi.object().keys({
  name: Joi.string().required(),
})

//create a new tag
router.post("/", async (ctx, next) => {
  //validate input
  const result = Joi.validate(ctx.request.body, tagPostSchema)
  if (result.error) {
    return ctx.body = {
      error: result.error.details[0].message
    }
  }
  //add this to the database
  const { name } = result.value
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
router.post("/rename", async (ctx, next) => {
  //validate input
  const result = Joi.validate(ctx.request.body, tagPostRenameSchema)
  if (result.error) {
    return ctx.body = {
      error: result.error.details[0].message
    }
  }
  //add this to the database
  const { oldName, newName } = result.value
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
router.delete("/", async (ctx, next) => {
  //validate input
  const result = Joi.validate(ctx.request.body, tagPostSchema)
  if (result.error) {
    return ctx.body = {
      error: result.error.details[0].message
    }
  }
  //delete tag and related post_tags from the database
  const { name } = result.value
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
router.post("/post", async (ctx, next) => {
  //validate input
  const result = Joi.validate(ctx.request.body, tagPostPostSchema)
  if (result.error) {
    return ctx.body = {
      error: result.error.details[0].message
    }
  }
  //add this to the database
  const { tagName, postId } = result.value
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
  //validate input
  const result = Joi.validate(ctx.request.body, tagPostPostSchema)
  if (result.error) {
    return ctx.body = {
      error: result.error.details[0].message
    }
  }

  //delete this from the database
  const { tagName, postId } = result.value
  const {sql, sqlite} = ctx.lib

  const tag = await sqlite.get(sql.tag.getByName(tagName))
  await sqlite.run(sql.postTag.deleteByTagIdAndPostId(tag.id, postId))

  ctx.body = {
    success: true
  }

})


module.exports = router.routes()