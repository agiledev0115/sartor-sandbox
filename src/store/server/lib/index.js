import winston from "winston"

class Utils {
  static normalizePort(val) {
    const port = parseInt(val, 10)

    if (Number.isNaN(port)) {
      // named pipe
      return val
    }

    if (port >= 0) {
      // port number
      return port
    }

    return false
  }

  static onError(port) {
    return error => {
      if (error.syscall !== "listen") {
        throw error
      }

      const bind = typeof port === "string" ? `Pipe ${port}` : `Port  ${port}`

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case "EACCES":
          console.error(`${bind} requires elevated privileges`)
          process.exit(1)
          break
        case "EADDRINUSE":
          console.error(`${bind} is already in use`)
          process.exit(1)
          break
        default:
          throw error
      }
    }
  }

  static onListening(server) {
    return () => {
      const addr = server.address()
      const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`

      winston.info(`Listening on ${bind}`)
    }
  }

  static mongoErrorHandler() {
    winston.info("Responding to MongoDB connection error.")
    console.error(
      "MongoDB connection error. Please make sure MongoDB is running"
    )
    process.exit(1)
  }
}

export default Utils
