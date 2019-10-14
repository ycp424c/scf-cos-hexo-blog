const fs = require('fs')
const path = require('path')
const {makeRetHtml, makeRetJson,CONST:{API_ROOT,PUBLIC_ROOT} } = require('./lib/util')
const { UNCAUGHT_ERROR } = require('./lib/errorCode')


module.exports.main_handler = async function(event, context, callback) {
    console.log(event.path)
   console.log(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''))) 
   console.log(fs.existsSync(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''))))
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
      console.error(err)
      return makeRetJson({
        code: UNCAUGHT_ERROR,
        message: err.message
      })
    }
  }if(event 
    && event.path 
    && (
      fs.existsSync(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''))) 
      || fs.existsSync(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''),'index.html')))){
    if(fs.existsSync(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''),'index.html'))){
      return await makeRetHtml(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''),'index.html'))
    }
    return await makeRetHtml(path.resolve(PUBLIC_ROOT,event.path.replace('/publishCosBlog/',''))) 
  } else {
    return makeRetJson({ code: 0, message: 'nothing to do' })
  }
}