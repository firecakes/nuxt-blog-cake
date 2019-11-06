require('dotenv').config()
const config = require('../config')
const fs = require('fs')

// MODIFY LOGGING STATISTICS IN THE PROCESS FUNCTION
/* data currently comes in this format:
{
  "method": "GET",
  "url": "/post/testing/",
  "origin": "http://localhost:3000",
  "query":{}, 
  "ip":"127.0.0.1", 
  "responseTime":4, 
  "date":1572925955620
}
*/

//apply transformations here! below is an example of what may give useful information
function process (data) {
  console.log("Website statistics:")

  //find the top three most viewed posts
  const mostViewedPosts = analyzer(data)
    //focus only on people viewing posts
    .filter("url", e => e.startsWith("/post"))
    //sum up the total number of visits for each unique url
    .partition("url")
    .max("count", 3)
  console.log(`The most viewed posts are:`) 
  for (let i in mostViewedPosts) {
    console.log(`${mostViewedPosts[i].name} with ${mostViewedPosts[i].count} visits!`)
  }
  console.log() 

  //find the total number of calls the server had to handle
  console.log(`Total number of server requests: ${data.length}`) 
  console.log() 

  //find the total number of visits over the last week
  const totalVisits = analyzer(data)
    //focus only on intentionally viewed pages, also removing file access routes
    .filter("url", e => !e.startsWith("/api"))
    .filter("url", e => e.endsWith("/"))
    //only get published data within a week of now 
    .filter("date", e => (e + 1000*60*60*24*7) > Date.now())
  console.log(`Total visits in the last 7 days: ${totalVisits.done().length}`) 
  console.log() 

  //find requests that have been taking a long time to respond to
  const longestLoaded = analyzer(data)
    .max("responseTime", 5)
  console.log(`Slowest routes:`) 
  for (let i in longestLoaded) {
    console.log(`${longestLoaded[i].url}: ${longestLoaded[i].responseTime}ms`)
  }
  console.log()
}

// BELOW IS SETUP CODE

//transformation functions
function analyzer (data) {
  data = JSON.parse(JSON.stringify(data)) //clone the data
  let options = {
    done: () => data, //get the transformed data
    filter: (prop, func) => { //remove entries that dont match a condition
      data = data.filter(e => func(e[prop]))
      return options
    },
    partition: (prop) => { //count up all unique occurences of a certain property
      let counts = {}
      for (let i in data) {
        const value = data[i][prop]
        if (!counts[value]) counts[value] = 0
        counts[value]++
      }
      data = []
      for (let prop in counts) {
        data.push({
          name: prop,
          count: counts[prop]
        })
      }
      return options
    },
    max: (prop, howMany = 1) => { //finds the datum with the maximum value of a certain property
      return data.sort((a, b) => b[prop] - a[prop]).slice(0, howMany)
    },
    min: (prop, howMany = 1) => { //finds the datum with the minimum value of a certain property
      return data.sort((a, b) => a[prop] - b[prop]).slice(0, howMany)
    }
  }
  return options
}

//read the log file

if (!config.logFile) return

//read each line as a JSON entry and categorize the data
let buffStr = ""
let data = []

const stream = fs.createReadStream(config.logFile)
stream.on('data', chunk => {
  buffStr += chunk.toString('utf8')
  //extract only complete lines
  const splitString = buffStr.split('\n')
  const fullLines = splitString.slice(0, -1)
  //put the last line back in the buffer. assume it's not done yet
  buffStr = splitString.slice(-1).join('\n')
  for (let i in fullLines) {
    if (fullLines[i] === '') continue //ignore empty lines
    data.push(JSON.parse(fullLines[i])) //move full lines into data
  }
})
stream.on('end', () => {
  //done reading. flush the buffer and start analyzing
  if (buffStr.length > 0) {
    data.push(buffStr)
  }
  process(data)
})
