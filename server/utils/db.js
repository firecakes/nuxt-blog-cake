const db = require('sqlite')

//start the database
module.exports = {
  dbInit: async function () {
    return Promise.resolve()
      .then(() => db.open('./database.sqlite', { Promise }))
      .then(db => db.migrate())
      //use this if you want to redo the last migration script on server start
      //.then(db => db.migrate({ force: 'last' }))
  },
  sqlite: db,
}