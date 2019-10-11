const nodeJieba = require('nodejieba')
const fs = require('fs')

let text = fs.readFileSync('./blog/source/_posts/webpack-server-app.md')
let keyWord = nodeJieba.extract(text, 10)

console.log(keyWord)