import _ from "lodash"
import unless from "express-unless"
import CustomError from "./custom-error"
import TokenDal from "../dal/token"

function middleware(req, res, next) {
  let accessToken = null
  console.log(req.headers.authorization)
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ")
    if (parts.length === 2) {
      const scheme = parts[0]
      const credentials = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        accessToken = credentials
      } else {
        return next(
          new CustomError({
            name: "CREDENTIALS_SCHEME_ERROR",
            message: "Format is Authorization: Bearer [token]",
          })
        )
      }
    } else {
      return next(
        new CustomError({
          name: "CREDENTIALS_FORMAT_ERROR",
          message: "Format is Authorization: Bearer [token]",
        })
      )
    }
  } else if (req.query && req.query["access-token"]) {
    accessToken = req.query["access-token"]
  }

  if (!accessToken) {
    return next(
      new CustomError({
        name: "CREDENTIALS_REQUIREMENT_ERROR",
        message: "No authorization token was found",
      })
    )
  }

  TokenDal.get({ value: accessToken }, (err, token) => {
    if (err) {
      return next(err)
    }

    if (!token._id) {
      return next(
        new CustomError({
          name: "CREDENTIALS_REQUIREMENT_ERROR",
          message: "Access Token provided is invalid",
        })
      )
    }

    req._user = token.user || null
    next()
  })
}

function authorizeAccess(opts = this || {}) {
  const options = {}

  _.extend(options, opts)

  middleware.unless = unless

  return middleware
}

export default authorizeAccess
