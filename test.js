let h  = require('./scf_public').main_handler

async function init(){
	let ret = await h({queryString:{
		method: 'comment'
	}})
	
	console.log(ret)
}
init()