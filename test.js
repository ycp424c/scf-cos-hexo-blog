let h  = require('./scf_public').main_handler

async function init() {
  let ret = await h({
    queryString: {
      // method: 'generate_tag',
      // param: JSON.stringify({
      //   searchString: 'local'
      // })
    },
    path:'/index.html'
  })

  console.log(ret)
}
init()