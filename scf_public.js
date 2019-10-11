const fs = require('fs')
const path = require('path')
const API_ROOT = path.resolve(__dirname, './api')
const { makeRetJson } = require('./lib/util')
const { UNCAUGHT_ERROR } = require('./lib/errorCode')


module.exports.main_handler = async function(event, context, callback) {

  if (event && event.queryString && event.queryString.method && ((fs.existsSync(path.resolve(API_ROOT, event.queryString.method)) && fs.statSync(path.resolve(API_ROOT, event.queryString.method)).isDirectory() && fs.existsSync(path.resolve(API_ROOT, event.queryString.method, 'index.js')))) || (fs.existsSync(path.resolve(API_ROOT, `${event.queryString.method}.js`)))
  ) {
    try {
      let handler
      if (fs.existsSync(path.resolve(API_ROOT, event.queryString.method)) && fs.statSync(path.resolve(API_ROOT, event.queryString.method)).isDirectory()) {
        handler = require(path.resolve(API_ROOT, event.queryString.method, 'index.js'))
      } else {
        handler = require(path.resolve(API_ROOT, `${event.queryString.method}.js`))
      }
      let param = event.body && event.body.param || JSON.parse(event.queryString && event.queryString.param || '{}')
      return await handler(param)
    } catch (err) {
      return makeRetJson({
        code: UNCAUGHT_ERROR,
        message: err.message
      })
    }
  } else {
    return makeRetJson({ code: 0, message: 'nothing to do' })
  }
}