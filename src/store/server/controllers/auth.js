import crypto from "crypto"
import moment from "moment"
import events from "events"
import UserModel from "../models/user"
import UserDal from "../dal/user"
import TokenDal from "../dal/token"
import settings from "../../../../config/server"
import CustomError from "../lib/custom-error"

class AuthController {
  constructor() {}

  static login(req, res, next) {
    const body = req.body
    const workflow = new events.EventEmitter()

    workflow.on("validateData", function validateData() {
      req
        .checkBody("username")
        .notEmpty()
        .withMessage(settings.errorResponse.userNameEmpty)
        .isEmail()
        .withMessage(settings.errorResponse.userNameEmail)
      req
        .checkBody("password")
        .notEmpty()
        .withMessage(settings.errorResponse.passwordEmpty)
        .len(6, 20)
        .withMessage(settings.errorResponse.passwordLength)

      const errs = req.validationErrors()
      if (errs) {
        res.status(400)
        res.json({
          error: true,
          msg: errs,
          status: 400,
        })
        return
      }
      workflow.emit("validateUsername")
    })

    workflow.on("validateUsername", function validateUsername() {
      UserModel.findOne(
        {
          username: req.body.username,
        },
        function done(err, user) {
          if (err) {
            return next(err)
          }
          if (!user) {
            res.status(404)
            res.json({
              error: true,
              msg: "User Not Found!",
              status: 404,
            })
            return
          }
          workflow.emit("validateUserpassword", user)
        }
      )
    })

    workflow.on("validateUserpassword", function validateUserpassword(user) {
      user.checkPassword(body.password, function done(err, isOk) {
        if (err) {
          return next(err)
        }
        if (!isOk) {
          res.status(403)
          res.json({
            error: true,
            msg: "Wrong credentials",
            status: 403,
          })
          return
        }
        workflow.emit("generateToken", user)
      })
    })

    workflow.on("generateToken", function generateToken(user) {
      TokenDal.get({ user: user._id }, function done(err, token) {
        if (err) {
          return next(err)
        }
        crypto.randomBytes(settings.TOKEN_LENGTH, function tokenGenerator(
          err,
          buff
        ) {
          if (err) {
            return next(err)
          }
          const tokenValue = buff.toString("base64")
          // Generate a new token
          if (!token._id) {
            TokenDal.create(
              { user: user._id, value: tokenValue, revoked: false },
              function createToken(err, token) {
                if (err) {
                  return next(err)
                }
                // console.log(token.value)
                workflow.emit("respond", user, token.value)
              }
            )
          } else {
            // Update Value
            TokenDal.update(
              { _id: token._id },
              { value: tokenValue, revoked: false },
              function updateToken(err, token) {
                if (err) {
                  return next(err)
                }
                workflow.emit("respond", user, token.value)
              }
            )
          }
        })
      })
    })

    workflow.on("respond", function respond(user, tokenValue) {
      const now = moment().toISOString()

      UserDal.update(
        { _id: user._id },
        { last_login: now },
        function updateLogin(err, user) {
          if (err) {
            return next(err)
          }
          user = user.toJSON()
          delete user.password
          req._user = user
          res.json({
            token: tokenValue,
            user,
          })
        }
      )
    })

    workflow.emit("validateData")
  }

  static logout(req, res, next) {
    if (!req._user) {
      return next(
        new CustomError({
          name: "LOGOUT_ERROR",
        })
      )
    }
    TokenDal.update(
      { user: req._user._id },
      { value: "EMPTY", revoked: true },
      (err, token) => {
        if (err) {
          return next(
            new CustomError({
              name: "SERVER_ERROR",
              message: err.message,
            })
          )
        }
        res.json({
          logged_out: true,
        })
      }
    )
  }

  static accessControl(roles, action) {
    action = action || "ALLOW"

    return (req, res, next) => {
      const user = req._user
      if (!user) {
        return next(
          new CustomError({
            name: "AUTHORIZATION_ERROR",
            message: "Please Login or register to continue",
          })
        )
      }
      const userRole = user.role
      let allowed = false

      roles = Array.isArray(roles) ? roles : [roles]
      roles.forEach(role => {
        switch (role) {
          case "*":
          case userRole:
            allowed = true
            break
          default:
            break
        }
      })

      if (!allowed) {
        return next(
          new CustomError({
            name: "AUTHORIZATION_ERROR",
          })
        )
      }

      return next()
    }
  }
}

export default AuthController
