import Busboy from "busboy"

const RE_MIME = /^(?:multipart\/.+)/i

// utility functions copied from Connect

function hasBody(req) {
  const encoding = "transfer-encoding" in req.headers
  const length =
    "content-length" in req.headers && req.headers["content-length"] !== "0"

  return encoding || length
}

function mime(req) {
  const str = req.headers["content-type"] || ""

  return str.split(";")[0]
}

function multipart(options = this || {}) {
  return (req, res, next) => {
    if (
      req.busboy ||
      req.method === "GET" ||
      req.method === "HEAD" ||
      !hasBody(req) ||
      !RE_MIME.test(mime(req))
    ) {
      return next()
    }

    const cfg = {}
    Object.keys(options).forEach(prop => {
      cfg[prop] = options[prop]
    })

    cfg.headers = req.headers
    req.busboy = new Busboy(cfg)

    if (options.immediate) {
      process.nextTick(() => {
        req.pipe(req.busboy)
      })
    }

    next()
  }
}

export default multipart
