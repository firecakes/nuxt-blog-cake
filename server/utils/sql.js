const sql = require('sql-bricks-sqlite')
const luxon = require('luxon')

module.exports = {
  sql: {
    getLastInsert: function () {
      return "SELECT last_insert_rowid()"
    },
    addFilter: function (queryLimit, offset) {
      return ` LIMIT ${queryLimit} OFFSET ${offset}`
    },
    orderCollection: function () { //orderCollection should come before addFilter
      return " ORDER BY order_number ASC"
    },
    orderPosts: function () { //orderPosts should come before addFilter
      return " ORDER BY id DESC"
    },
    post: {
      create: function (obj) {
        //timestamp the post in ISO format
        return sql.insert('post', {
          entry: obj.entry,
          preview: obj.preview,
          title: obj.title,
          directory: obj.directory,
          timestamp_iso: luxon.DateTime.utc().toISO()
        }).toString()
      },
      get: function () {
        return sql.select('*').from('post').toString()
      },
      getById: function (id) {
        return sql.select('*').from('post').where({id: id}).toString()
      },
      getByTagId: function (tagId) {
        return sql.select('post.*')
          .from('post_tag')
          .where({tag_id: tagId})
          .join('post', {'post_tag.post_id': 'post.id'})
          .toString()
      },
      getByTagName: function (tagName) {
        return getByTagName(tagName).toString()
      },
      getByCollectionName: function (collName) {
        return getByCollectionName(collName).toString()
      },
      getByTagAndCollectionName: function (tagName, collName) {
        return getByTagName(tagName)
          .join(`(${getByCollectionName(collName).toString()}) post_col`, {
            'post_col.id': 'post.id'
          }).toString()
      },
      deleteById: function (id) {
        return sql.delete().from('post').where({id: id}).toString()
      },
      updateByTitleName: function (id, newTitle) {
        return sql.update('post', {title: newTitle}).where({id: id}).toString()
      }
    },
    tag: {
      create: function (tags) {
        const tagsSql = tags.map(t => {
          return {name: t}
        })
        return sql.insert('tag').values(tagsSql).toString()
      },
      getByName: function (tagNames) {
        return sql.select('*').from('tag')
          .where(sql.in('name', tagNames)).toString()
      },
      get: function () {
        return sql.select('*').from('tag').toString()
      },
      deleteByName: function (name) {
        return sql.delete().from('tag').where({name: name}).toString()
      },
      updateByName: function (oldName, newName) {
        return sql.update('tag', {name: newName}).where({name: oldName}).toString()
      }
    },
    postTag: {
      create: function (postTags, postId) {
        const postTagArr = postTags.map(pt => {
          return {tag_id: pt.id, post_id: postId}
        })
        return sql.insert('post_tag').values(postTagArr).toString()
      },
      get: function () {
        return sql.select('*').from('post_tag').toString()
      },
      getWithTagName: function () {
        return sql.select('post_tag.*', 'tag.name')
          .from('post_tag')
          .join('tag', {'post_tag.tag_id': 'tag.id'})
          .toString()
      },
      getByTagName: function (tagName) {
        return sql.select('post_tag.*')
          .from('post_tag')
          .join('tag', {'post_tag.tag_id': 'tag.id'})
          .where({name: tagName})
          .toString()
      },
      getByTagId: function (tagId) {
        return sql.select('*')
          .from('post_tag')
          .where({tag_id: tagId})
          .toString()
      },
      deleteByPostId: function (postId) {
        return sql.delete().from('post_tag').where({post_id: postId}).toString()
      },
      deleteByTagId: function (tagId) {
        return sql.delete().from('post_tag').where({tag_id: tagId}).toString()
      },
      deleteByTagIdAndPostId: function (tagId, postId) {
        return sql.delete().from('post_tag').where({
          tag_id: tagId,
          post_id: postId,
        }).toString()
      },
    },
    collection: {
      create: function (name) {
        return sql.insert('collection', {
          name: name,
          timestamp_iso: luxon.DateTime.utc().toISO()
        }).toString()
      },
      get: function () {
        return sql.select('*').from('collection').toString()
      },
      getByName: function (collectionNames) {
        return sql.select('*').from('collection')
          .where(sql.in('name', collectionNames)).toString()
      },
      deleteByName: function (name) {
        return sql.delete().from('collection').where({name: name}).toString()
      },
      updateByName: function (oldName, newName) {
        return sql.update('collection', {name: newName}).where({name: oldName}).toString()
      }
    },
    collectionItem: {
      create: function (collArr) {
        const sanitizedArr = collArr.map(coll => {
          return {
            collection_id: coll.collection_id,
            post_id: coll.post_id,
            order_number: coll.order_number
          }
        })
        return sql.insert('collection_item').values(sanitizedArr).toString()
      },
      get: function () {
        return sql.select('*').from('collection_item').toString()
      },
      getWithName: function () {
        return sql.select('*')
          .from('collection_item')
          .join('collection', {'collection_item.collection_id': 'collection.id'})
          .toString()
      },
      getWithPost: function () {
        return sql.select('*')
          .from('collection_item')
          .join('post', {'collection_item.post_id': 'post.id'})
          .toString()
      },
      getByCollectionId: function (collectionId) {
        return sql.select('collection_item.*')
          .from('collection')
          .where({id: collectionId})
          .join('collection_item', {'collection.id': 'collection_item.collection_id'})
          .toString()
      },
      getByCollectionName: function (collName) {
        return sql.select('collection_item.*')
          .from('collection_item')
          .join('collection', {'collection_item.collection_id': 'collection.id'})
          .where({name: collName})
          .toString()
      },
      deleteByPostId: function (id) {
        return sql.delete().from('collection_item').where({post_id: id}).toString()
      },
      deleteByCollectionId: function (id) {
        return sql.delete().from('collection_item').where({collection_id: id}).toString()
      },
      deleteByCollectionIdAndOrder: function (id, order) {
        return sql.delete().from('collection_item').where({
          collection_id: id,
          order_number: order,
        }).toString()
      }
    }
  }
}

function getByTagName (tagName) {
  return sql.select('post.*')
    .from('post_tag')
    .join('tag', {'post_tag.tag_id': 'tag.id'})
    .where({'tag.name': tagName})
    .join('post', {'post.id': 'post_tag.post_id'})
}

function getByCollectionName (collName) {
  return sql.select('post.*', 'order_number')
    .from('collection_item')
    .join('collection', {'collection_item.collection_id': 'collection.id'})
    .where({'collection.name': collName})
    .join('post', {'post.id': 'collection_item.post_id'})
}


