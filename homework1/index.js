const http = require("http")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder
const config = require("./config")

// The server should resposnd to all requests with a string.
const httpServer = http.createServer((req, res) => unifiedServer(req, res))

//start the server
httpServer.listen(config.httpPort, function() {
  console.log(`The server is listening on ${config.httpPort}`)
})

//All the server logic
const unifiedServer = function(req, res) {
  const parsedURL = url.parse(req.url, true)
  const path = parsedURL.pathname
  const trimmedPath = path.replace(/^\/|\/+$/g, "")
  const queryStringObject = parsedURL.query
  const method = req.method.toLocaleLowerCase()
  const headers = req.headers

  //Get the payload, if any
  const decoder = new StringDecoder("utf-8")
  let buffer = ""
  req.on("data", function(data) {
    buffer += decoder.write(data)
  })
  req.on("end", () => {
    buffer += decoder.end()

    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound

    const data = {
      trimmedPath: trimmedPath,
      queryStringObeject: queryStringObject,
      method: method,
      payload: buffer
    }

    //Route the request to the handler specified in the router.
    chosenHandler(data, function(statusCode, payload) {
      statusCode = typeof statusCode == "number" ? statusCode : 200
      payload = typeof payload == "object" ? payload : {}
      const payloadStirng = JSON.stringify(payload)

      //Return the response
      res.setHeader("Content-Type", "application/json")
      res.writeHead(statusCode)
      res.end(payloadStirng)

      // Log the request path
      console.log(`Returning this response: `, statusCode, payloadStirng)
    })
  })
}

//Define the handlers
const handlers = {}

handlers.hello = function(data, callback) {
  const payload = {
    msg: 'hello world'
  }
  callback(200, payload)
}

handlers.ping = function(data, callback) {
  callback(200)
}

//Not found handler
handlers.notFound = function(data, callback) {
  callback(404)
}

//Define a request router
const router = {
  hello: handlers.hello,
  ping: handlers.ping
}
