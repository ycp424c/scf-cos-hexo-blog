const config = require('../cos_config')
const COS = require('cos-nodejs-sdk-v5')
let walk = require('walk')
const path = require('path')
const { makeRetJson } = require('../lib/util')

module.exports = async function publish() {
  const walker = walk.walk(path.resolve(__dirname, '../blog/public'))
  const cos = new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey
  })

  walker.on('file', function (root, fileStats, next) {
    let filePath = root + '/' + fileStats.name
    cos.sliceUploadFile({
      Bucket: config.bucketName, // Bucket 格式：test-1250000000
      Region: config.region,
      Key: filePath.replace(/(.*?)(\/blog\/public\/)/, ''),
      FilePath: filePath
      //eslint-disable-next-line no-unused-vars
    }, function (err, data) {
      err && console.error(err)
      next()
    })

  })
  let ret = await new Promise((res) => {
    walker.on('end', function () {
      console.log('all done')
      res(makeRetJson({
        code: 0,
        message: 'publish success'
      }))
    })
  })
  return ret
}