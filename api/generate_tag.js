const nodeJieba = require('nodejieba')
const fs = require('fs')
const path = require('path')
const {CONST:{POST_SOURCE_PATH}} = require('../lib/util')
const HFM = require('hexo-front-matter')

// const tagReg = /date\:(.*)\s(.*)\s/
const KEYWORD_COUNT = 10
const WEIGHT_LIMIT = 100

module.exports = async function(){
  let postList = fs.readdirSync(POST_SOURCE_PATH)
  postList.forEach((postName)=>{
    let postPath = path.resolve(POST_SOURCE_PATH,postName)
    let content = fs.readFileSync(postPath,'utf8')
    let postJson = HFM.parse(content)
    if(!postJson || !postJson.tag || postJson.tag.length === 0)
    {
      // 无tag的情况
      let keyWordList = nodeJieba.extract(content, KEYWORD_COUNT ) 
      if(keyWordList && keyWordList.length > 0){
        let keywordArr = []
        keyWordList.forEach(keyword=>{
          if(keyword.weight >= WEIGHT_LIMIT){
            keywordArr.push(keyword.word)
          }
        })
        if(keywordArr.length > 0){
          console.log(postName,'generate tag success:',keywordArr.join('|'))
          postJson.tag = keywordArr
          fs.writeFileSync(postPath,HFM.stringify(postJson))
        }
      }
    }
  })
}