const Joi = require("joi")
const Router = require("koa-router")
const router = new Router()
const validate = require("../../validate")

const collectionPostSchema = Joi.object().keys({
  name: Joi.string().required(),
})

//create a new collection
router.post("/", validate(collectionPostSchema), async (ctx, next) => {
  //add this to the database
  const { name } = ctx.request.body
  const {sql, sqlite} = ctx.lib
  const createResult = await sqlite.run(sql.collection.create(name)).catch(err => {
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

const collPostRenameSchema = Joi.object().keys({
  oldName: Joi.string().required(),
  newName: Joi.string().required(),
})

//rename collection
router.post("/rename", validate(collPostRenameSchema), async (ctx, next) => {
  //add this to the database
  const { oldName, newName } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const updateResult = await sqlite.run(sql.collection.updateByName(oldName, newName)).catch(err => {
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

//delete a collection
router.delete("/", validate(collectionPostSchema), async (ctx, next) => {
  //delete this from the database
  const { name } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const collection = await sqlite.get(sql.collection.getByName(name))

  await sqlite.run(sql.collectionItem.deleteByCollectionId(collection.id))
  await sqlite.run(sql.collection.deleteByName(name))

  ctx.body = {
    success: true
  }
})

const collectionPostPostSchema = Joi.object().keys({
  collectionName: Joi.string().required(),
  postId: Joi.number().integer().required(),
  order: Joi.number().integer().required()
})

//add a post to a collection
router.post("/post", validate(collectionPostPostSchema), async (ctx, next) => {
  //add this to the database
  const { order, collectionName, postId } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  const collection = await sqlite.get(sql.collection.getByName(collectionName))

  //return details of failure if an order number is already taken
  const createResult = await sqlite.run(sql.collectionItem.create([
    {collection_id: collection.id, post_id: postId, order_number: order},
  ])).catch(err => {
    //log any unexpected errors. unique constraint is expected
    if (err.code !== 'SQLITE_CONSTRAINT') { 
      console.log(err)
    }
    return false
  })
  if (!createResult) {
    return ctx.body = {
      success: false,
    }
  }

  ctx.body = {
    success: true
  }   
})

const collectionPostDeleteSchema = Joi.object().keys({
  id: Joi.number().integer().required(),
  order: Joi.number().integer().required()
})

//delete a post from a collection
router.delete("/post", validate(collectionPostDeleteSchema), async (ctx, next) => {
  //delete this from the database
  const { id, order } = ctx.request.body
  const {sql, sqlite} = ctx.lib

  await sqlite.run(sql.collectionItem.deleteByCollectionIdAndOrder(id, order))

  ctx.body = {
    success: true
  }
})


module.exports = router.routes()