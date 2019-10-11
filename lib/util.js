const path = require('path')
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
}

module.exports = {
  makeRetJson,
  CONST
}
