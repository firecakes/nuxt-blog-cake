const sqlDatabase = require('sqlite')
const sqlite3 = require('sqlite3')

//start the database
module.exports = {
  dbInit: async function () {
  	const db = await sqlDatabase.open({
	    filename: './database.sqlite',
	    driver: sqlite3.Database
	  })
	  await db.migrate()
	  return db
    //use this if you want to redo the last migration script on server start
    //db.migrate({ force: true })
  }
}