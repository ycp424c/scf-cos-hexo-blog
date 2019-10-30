const { makeRetJson } = require('../lib/util')
const path = require('path')
const fs = require('fs')
const ErrorCode = require('../lib/errorCode')
const HFM = require('hexo-front-matter')

const POST_ROOT = path.resolve(__dirname, '../blog/source/_posts')

module.exports = async function search(param) {

  if (!param || !param.searchString) {
    return makeRetJson({
      code: ErrorCode.NO_SEARCH_PARAM,
      message: 'please add param : searchString'
    })
  }

  let result = []

  let postArr = fs.readdirSync(POST_ROOT)

  postArr.forEach((postName) => {
    let postContent = fs.readFileSync(path.resolve(POST_ROOT, postName), 'utf8')
    let postJson = HFM.parse(postContent)
    let searchIndex = postContent.indexOf(param.searchString)
    if (searchIndex >= 0) {
      console.log(Math.max(0, searchIndex - 10), param.searchString.length + 20)
      result.push({
        title: postJson.title, 
        clip: postContent.substr(Math.max(0, searchIndex - 10), param.searchString.length + 20),
        name: postName,
        date: postJson.date
      })
    }
  })

  console.log(result)

  return makeRetJson({
    code: 0,
    message: 'doing search',
    result
  })
}
