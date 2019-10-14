const path = require('path')
const fs = require('fs')
const extMap = {
  'html': 'text/html',
  'js': 'application/x-javascript',
  'css':'text/css',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'woff': 'application/font-woff',
  'eot': 'application/vnd.ms-fontobject',
  'ttf': 'application/x-font-ttf',
  'otf':'application/x-font-opentype'
}
const textType = ['html','js','css']

async function readFileStream(filePath, encoding) {
  return new Promise(resolve => {
    let resString = ''
    const stream = fs.createReadStream(filePath, {
      encoding,
      highWaterMark: 20
    })
    stream.on('data', data => {
      resString += data
    })
    stream.on('close', () => {
      stream.destroy()
      if (encoding === 'binary')
        resString = Buffer.from(resString, 'binary').toString('base64')
      resolve(resString)
    })
  })
}

function makeRetJson(json) {
  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(json)
  }
}
const CONST = {
  POST_SOURCE_PATH: path.resolve(__dirname, '../blog/source/_posts')
  ,API_ROOT : path.resolve(__dirname, '../api')
  ,PUBLIC_ROOT: path.resolve(__dirname,'../blog/public')
}

async function makeRetStatic(path){
  let content 
  let extName = path.split('.')
  extName = extName[extName.length-1].toLowerCase()
  let isText = textType.indexOf(extName) >= 0
  if(isText ){
    content = fs.readFileSync(path,'utf8') 
  }else{
    content = await readFileStream(path,'binary')
  }
  return {
    isBase64Encoded: !isText,
    statusCode: 200,
    headers: { 'Content-Type': `${getContentType(extName)}; ${isText? 'charset=utf-8':''}` },
    body:content   
  }
}

function getContentType(extName){
  return extMap[extName] || 'text/html'
}

module.exports = {
  makeRetJson,
  makeRetStatic,
  CONST
}