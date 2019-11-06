const Joi = require("joi")

//a function to help validate a request and respond appropriately on errors
//defaults to checking the body property. change prop to query for GET requests
module.exports = function (schema, prop = 'body') {
  return async function (ctx, next) {
    //validate input
    const result = Joi.validate(ctx.request[prop], schema)
    if (result.error) {
      ctx.status = 400
      return ctx.body = {
        error: result.error.details[0].message
      }
    }
    ctx.request[prop] = result.value //just in case Joi does some sanitization
    await next() //is valid. continue. the await is important
  }
}