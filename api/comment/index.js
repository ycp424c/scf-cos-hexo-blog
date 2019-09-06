const {makeRetJson} = require('../../lib/util')

module.exports = async function(){
	return makeRetJson({
		code: 0,
		message: 'making comment'
	})
}