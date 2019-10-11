let h  = require('./scf_public').main_handler

async function init() {
  let ret = await h({
    queryString: {
      method: 'search',
      param: JSON.stringify({
        searchString: 'local'
      })
    }
  })

  console.log(ret)
}
init()