//middleware which stops traffic from reaching certain pages
const config = require('../config')
//anything with these prefixes will be inaccessible if admin access is off
const PRIVATE_URLS = [
	"/admin", //pages where you can manage content
	"/" + config.stagingRoutePrefix, //pages which aren't to be considered live yet
	"/api/collection", //collection API
	"/api/post", //post API
	"/api/tag", //tag API
	"/api/search/post/all", //for getting every post. it is an expensive operation
]

module.exports = async (ctx, next) => {
	if (ctx.config.adminAccess) return await next() //admin access on. allow all routes to be accessible

	const url = ctx.req.url 

	//check that the url the client requested isn't one of the private urls
	for (let i = 0; i < PRIVATE_URLS.length; i++) {
		if (url.startsWith(PRIVATE_URLS[i])) { //prefix matches a private url
			return ctx.response.status = 401
		}				
	}

	//the route is allowed to be accessed
	await next()
}
