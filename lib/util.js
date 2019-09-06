function makeRetJson(json){
    return {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(json)
    }
}

module.exports = {
	makeRetJson
}
