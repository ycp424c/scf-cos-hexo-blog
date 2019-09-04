const config = require('./cos_config')
const COS = require('cos-nodejs-sdk-v5')
const fs = require('fs')
var walk = require('walk');
const path = require('path')


module.exports.main_handler = async function(a,b,callback){
	const walker = walk.walk(path.resolve(__dirname,"./blog/public"));
	const cos = new COS({
		SecretId: config.secretId,
		SecretKey: config.secretKey
	})
 
	walker.on("file", function (root, fileStats, next) {
		let filePath = root+'/'+fileStats.name
		console.log(filePath)
		cos.sliceUploadFile({
			Bucket: config.bucketName, // Bucket 格式：test-1250000000
			Region: config.region,
			Key: filePath.replace(/(.*?)(\/blog\/public\/)/,''),
			FilePath: filePath
		}, function (err, data) {
			console.log(err, data);
			next()
		});
		
	});
    let ret = await new Promise((res)=>{
        walker.on("end", function () {
            console.log("all done");
            res({
                 isBase64Encoded: false,
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: JSON.stringify({
                        code:0,
                        message: 'successa'
                    })
            })
        });
    })
    return ret
}