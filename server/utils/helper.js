const promisify = require('util').promisify
const fs = require('fs')
const readDir = promisify(fs.readdir)
const move = promisify(fs.rename)
const path = require('path')
const mkdirp = promisify(require('mkdirp'))
const writeFile = promisify(fs.writeFile)
const formatXml = require('xml-formatter')
const copy = require('recursive-copy')
const rimraf = promisify(require('rimraf'))
const config = require('../../config')

async function recurseDirRead (location) {
  return await readDir(location)
    .then(fileNames => {
      //this is a map of promises!
      const promisedResults = fileNames.map(async fileName => {
        return {
          name: fileName,
          contents: await recurseDirRead(path.join(location, fileName))
        }
      })
      return Promise.all(promisedResults)
    })
    .catch(err => {
      if (err.code !== "ENOTDIR" && err.code !== "ENOENT" ) { //ignore errors where files aren't directories
        console.log(err)
      }
      return false
    })
}

module.exports = {
  //recursively finds all directories and files and returns an object representation of them
  recurseDirRead: recurseDirRead,
  moveDirectory: async function (oldD, newD) {
    //attempt a copy. if successful, delete the source. if not, delete the destination
    //for rimraf, set options glob pattern to false
    return await copy(oldD, newD, {
      overwrite: true,
      dot: true,
      junk: true
    })
    .then(async () => { //success. delete the source
      await rimraf(oldD, {disableGlob: true})
      return true
    })
    .catch(async (error) => { //failure. delete the destination
      await rimraf(newD, {disableGlob: true})
      console.log(error)
      return false
    })
  },
  //writes HTML content into a directory inside a timestamped, titled folder
  writeHtml: async function (params) { 
    const {title, html} = params
    const timestamp = Date.now()
    const folderName = `${title}-${timestamp}`
    const fileName = "index.vue"
    //create the directory for the post and include the file inside it. make it a Vue-compatible file
    await mkdirp(`./${config.stagingPrefix}/${folderName}`)
    await writeFile(`./${config.stagingPrefix}/${folderName}/${fileName}`, formatXml(`<template><div>${html}</div></template>`))
    return {
        folderName: folderName,
        entryPoint: fileName
    }
  },
  writeStream: function (path) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(path, {flags: 'a'})
      stream.once('open', () => {
        resolve(stream)
      })
      stream.on('end', reject)
    }) 
  }
}