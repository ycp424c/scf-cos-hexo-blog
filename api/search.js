const {makeRetJson} = require('../lib/util')

module.exports = async function search(){
    return makeRetJson({
        code:0,
        message: 'doing search'
    })
}
