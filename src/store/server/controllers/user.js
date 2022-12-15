import events from "events"
import moment from "moment"
import bcrypt from "bcrypt"
import crypto from "crypto"
import nodemailer from "nodemailer"
import settings from "../../../../config/server"
import UserModel from "../models/user"
import UserDal from "../dal/user"
import InternalDal from "../dal/internal"
import CustomerDal from "../dal/customers"
import SalerDal from "../dal/salers"

class UserController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateUser(req, res, next, id) {
    // Validate the id is mongoid or not
    req.checkParams("id", "Invalid param").isMongoId(id)

    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(404).json({
        error: true,
        message: "Not Found",
        status: 404,
      })
    } else {
      UserDal.get(
        {
          _id: id,
        },
        (err, doc) => {
          if (doc._id) {
            req.doc = doc
            next()
          } else {
            res.status(404).json({
              error: true,
              status: 404,
              msg: `User _id ${id} not found`,
            })
          }
        }
      )
    }
  }

  static getUserInfo(req, res, next) {
    if (!req._user) {
      res.status(401).json({
        message: "Unauthorized user!",
      })
      return
    }
    UserModel.findById(req._user.id).exec((err, user) => {
      if (err) return next(err)
      res.json(user)
    })
  }

  static register(req, res, next) {
    if (!req._user) {
      res.status(401).json({
        message: "Unauthorized user!",
      })
      return
    }
    const { body } = req.body
    const data = {
      first_name: body.first_name,
      last_name: body.last_name,
      org_name: body.org_name,
      phone: body.phone,
      country: body.country,
      is_registered: true,
    }
    UserDal.update(
      {
        _id: req._user._id,
      },
      data,
      function update(err, doc) {
        if (err) {
          return next(err)
        }
        res.json(doc)
      }
    )
  }

  static createUser(req, res, next) {
    const now = moment().toISOString()
    const workflow = new events.EventEmitter()
    const { body } = req.body
    workflow.on("validateUser", function validateUser() {
      // debug('validate user');
      // Validate User Data
      req
        .checkBody("username", "Username  should not be empty!")
        .isEmail()
        .withMessage("Username should be email")
        .notEmpty()
      req
        .checkBody("password")
        .notEmpty()
        .withMessage("password should not be empty")
        .len(6, 20)
        .withMessage("6 to 20 characters required")
      req
        .checkBody("user_type", "User Type is Invalid!")
        .notEmpty()
        .withMessage("User Type should not be Empty")
        .isIn(["super_admin", "admin", "data_encoder", "customers", "salers"])
        .withMessage("Invalid User type")

      // if org--> Sector
      /* if(body.user_type === 'organization'){
        req.checkBody('org_name')
        .notEmpty().withMessage('Organization name  should not be empty');
         }
      */
      const validationErrors = req.validationErrors()

      if (validationErrors) {
        res.status(400)
        res.json(validationErrors)
      } else {
        workflow.emit("checkUserExist")
      }
    })
    /**
     * Check for user exist or not
     */
    workflow.on("checkUserExist", function checkUserExist() {
      // debug("checkUserExist")
      const username = body.username
      // Query DB for a user with the given ID
      UserDal.get(
        {
          username,
        },
        function cb(err, user) {
          if (err) {
            return next(err)
          }
          // If user find return it
          if (user._id) {
            res.status(400)
            res.json({
              error: true,
              msg: "User already exists",
              status: 400,
            })
          } // automated crawler blocking
          else {
            workflow.emit("createUser")
          }
        }
      )
    })
    workflow.on("createUser", function createUser() {
      // debug("Creating user")
      // Create User
      body.created_at = now
      UserDal.create(
        {
          password: body.password,
          username: body.username,
          role: body.user_type,
        },
        function callback(err, user) {
          if (err) {
            return next(err)
          }
          workflow.emit("createUserType", user)
        }
      )
    })
    workflow.on("createUserType", function respond(user) {
      if (body.user_type === "admin") {
        req
          .checkBody("myRole", "Role is invalid!")
          .notEmpty()
          .withMessage("Your Role should not be Empty")
        req
          .checkBody("my_id", "User ID is Invalid!")
          .notEmpty()
          .withMessage("Your User ID should not be Empty")

        const currentUser = body.myRole
        const loggerId = body.my_id
        switch (currentUser) {
          case "super_admin":
            body.created_by = loggerId
            body.created_at = now
            body.role = body.role
            body.user = user._id
            InternalDal.create(body, function createInternal(err, doc) {
              if (err) {
                return next(err)
              }
              UserDal.update(
                {
                  _id: user._id,
                },
                {
                  internal: doc._id,
                  realm: "internal",
                },
                function updateUser(err, udoc) {
                  if (err) {
                    return next(err)
                  }
                  workflow.emit("respond", udoc, doc)
                }
              )
            })
            break
          default:
            res.status(401).json({
              message: "Unauthorized user!",
            })
            break
        }
      } else if (body.user_type === "super_admin") {
        body.user = user._id
        body.created_at = now
        body.role = body.role
        InternalDal.create(body, function createInternal(err, doc) {
          if (err) {
            return next(err)
          }
          UserDal.update(
            {
              _id: user._id,
            },
            {
              internal: doc._id,
              realm: "internal",
            },
            function updateUser(err, udoc) {
              if (err) {
                return next(err)
              }
              workflow.emit("respond", udoc, doc)
            }
          )
        })
      } else if (body.user_type === "customers") {
        body.user = user._id
        body.created_at = now
        body.role = body.role
        body.email = body.username
        // uniqune ID generation is over

        CustomerDal.create(body, function createIndividualEmployer(err, doc) {
          if (err) {
            return next(err)
          }
          UserDal.update(
            {
              _id: user._id,
            },
            {
              customers: doc._id,
              realm: "customers",
              helper: null,
            },
            function updateUser(err, udoc) {
              if (err) {
                return next(err)
              }
              workflow.emit("respond", udoc, doc)
            }
          )
        })
      } else if (body.user_type === "salers") {
        body.user = user._id
        body.created_at = now
        body.role = body.role
        // uniqune ID generation is over

        SalerDal.create(body, function CreateSalers(err, doc) {
          if (err) {
            return next(err)
          }
          UserDal.update(
            {
              _id: user._id,
            },
            {
              email: body.username,
              salers: doc._id,
              realm: "salers",
            },
            function updateUser(err, udoc) {
              if (err) {
                return next(err)
              }
              workflow.emit("respond", udoc, doc)
            }
          )
        })
      }
    })
    workflow.on("respond", function respond(user, doc) {
      res.status(201)
      res.json(user)
    })

    workflow.emit("validateUser")
  }

  static createAdmin(req, res, next) {
    const now = moment().toISOString()
    const { body } = req.body

    req
      .checkBody("username", "Username  should not be empty!")
      .isEmail()
      .withMessage("Username should be email")
      .notEmpty()
    req
      .checkBody("password")
      .notEmpty()
      .withMessage("password should not be empty")
      .len(6, 20)
      .withMessage("6 to 20 characters required")
    req
      .checkBody("user_type", "User Type is Invalid!")
      .notEmpty()
      .withMessage("User Type should not be Empty")
      .isIn(["super_admin", "corporate", "helper", "admin", "customers"])
      .withMessage("User Type should either be client or organization")
    const username = body.username
    body.created_at = now

    body.role = body.role

    // Query DB for a user with the given ID
    UserDal.get(
      {
        username,
      },
      function cb(err, user) {
        if (err) {
          return next(err)
        }
        // If user find return it

        if (user._id) {
          res.status(400)
          res.json({
            error: true,
            msg: "User already exists",
            status: 400,
          })
        } // automated crawler blocking
        else {
          UserDal.create(
            {
              password: body.password,
              username: body.username,
              role: body.user_type,
            },
            function callback(err, users) {
              if (err) {
                return next(err)
              } else {
                body.user = users._id
                body.created_by = req._user._id
                // body.created_by = req._user.id;

                InternalDal.create(body, function createInternal(err, doc) {
                  if (err) {
                    return next(err)
                  }

                  UserDal.update(
                    {
                      _id: users._id,
                    },
                    {
                      internal: doc._id,
                      realm: "internal",
                    },
                    function updateUser(err, udoc) {
                      if (err) {
                        return next(err)
                      }
                      res.status(200)
                      res.json({
                        status: 200,
                        message: "You Have successfully created Admin",
                        error: false,
                      })
                    }
                  )
                })
              }
            }
          )
        }
      }
    )
  }

  static getUser(req, res, next) {
    res.json(req.doc)
  }

  static changeRole(req, res, next) {
    const { body } = req.body
    const logger = req._user._id

    UserDal.update(
      {
        _id: logger,
      },
      body,
      function update(err, doc) {
        if (err) {
          return next(err)
        }
        res.status(200)
        res.json(doc)
      }
    )
  }

  static updateUser(req, res, next) {
    const { body } = req.body
    UserDal.get(
      {
        user_name: body.user_name,
      },
      function chekuser(err, doc) {
        if (doc._id) {
          res.status(409)
          res.json({
            error: true,
            msg: "Username already exists",
            status: 409,
          })
          return
        } else {
          // Update user profile
          body.updated_at = moment().toISOString()
          UserDal.update(
            {
              _id: req.doc._id,
            },
            body,
            function update(err, doc) {
              if (err) {
                return next(err)
              }
              res.json(doc)
            }
          )
        }
      }
    )
  }

  static deleteUser(req, res, next) {
    const { body } = req.body

    UserDal.delete(
      {
        _id: req.body._id,
      },
      function deleteUser(err, doc) {
        if (err) {
          return next(err)
        }
        res.json(doc)
      }
    )
  }

  static getUsers(req, res, next) {
    const options = {
      password: 0,
    }
    // Retrieve all the Users
    UserDal.getCollection({}, options, function getAllUsers(err, docs) {
      if (err) {
        return next(err)
      }

      res.json(docs)
    })
  }

  static passwordChange(req, res, next) {
    const body = req.body
    const now = moment().toISOString()

    const workflow = new events.EventEmitter()

    workflow.on("validateInput", function validateInput() {
      // req.checkBody('username', "Invalid User Name")
      //   .notEmpty();
      req.checkBody("old_password", "Invalid old_password").notEmpty()
      req.checkBody("new_password", "Invalid new_password").notEmpty()

      const validationErrors = req.validationErrors()
      if (validationErrors) {
        res.json(validationErrors)
      } else {
        workflow.emit("validateUsername")
      }
    })

    workflow.on("validateUsername", function validateUsername() {
      UserModel.findOne(
        {
          username: req._user.username,
        },
        function getUser(err, user) {
          if (err) {
            return next(err)
          }

          if (!user._id) {
            res.status(404)
            res.json({
              error: true,
              msg: "user is not found",
              status: 404,
            })
            return
          } else {
            workflow.emit("checkPassword", user)
          }
        }
      )
    })
    workflow.on("checkPassword", function checkPassword(user) {
      user.checkPassword(body.old_password, function check(err, isOk) {
        if (err) {
          return next(err)
        }
        if (!isOk) {
          res.status(403)
          //    console.log(body.old_password);
          res.json({
            error: true,
            message: "Wrong old password",
            status: 403,
          })
          return
        } else {
          workflow.emit("changePassword", user)
        }
      })
    })
    workflow.on("changePassword", function passwordChange(user) {
      bcrypt.genSalt(settings.SALT_LENGTH, function genSalt(err, salt) {
        if (err) {
          return next(err)
        }
        bcrypt.hash(body.new_password, salt, function hashPasswd(err, hash) {
          if (err) {
            return next(err)
          }

          const now = moment().toISOString()
          UserDal.update(
            {
              _id: user._id,
            },
            {
              password: hash,
              updated_at: now,
              logged_in_before: true,
            },
            function updatepass(err, user) {
              if (err) {
                return next(err)
              } else {
                workflow.emit("respond")
              }
            }
          ) // end of update
        }) // end of hash
      }) // end of gensalt
    })
    workflow.on("respond", function respond() {
      res.json({
        error: false,
        message: "Sucessfully changed.",
        status: 200,
      })
    })
    workflow.emit("validateInput")
  }

  static getByPagination(req, res, next) {
    const query = {}
    // retrieve pagination query params
    const page = req.query.page
    const limit = req.query.per_page
    const queryOpts = {
      page,
      limit,
    }
    // console.log(queryOpts);
    UserDal.getCollectionBYPagination(
      query,
      queryOpts,
      function getByPaginationCb(err, doc) {
        if (err) {
          return next(err)
        }
        if (!doc) {
          res.status(404),
            res.json({
              error: true,
              message: "Requested Data is not found",
              status: 404,
            })
        }
        res.json(doc)
      }
    )
  }

  static sendEmail1(req, res, next) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        enable_starttls_auto: true,
        user: "", // sender email address
        pass: "", // sender email password
      },
    })

    const mailOptions = {
      from: "", // sender email address
      to: "", // receiver email address
      subject: "Sending Email using Node.js",
      text: "That was easy!",
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log(`Email sent: ${info.response}`)
      }
    })
  }

  static resetPhonePass(req, res, next) {
    const body = req.body
    const phone = body.phone
    const token = body.reset_token
    const now = moment().toString()
    req
      .checkBody("new_password")
      .notEmpty()
      .withMessage("new password should not be empty")
      .len(6, 20)
      .withMessage("6 to 20 characters required")
    req
      .checkBody("confirmed_password")
      .notEmpty()
      .withMessage("confirm password should not be empty")
      .len(6, 20)
      .withMessage("6 to 20 characters required")

    if (body.new_password !== body.confirmed_password) {
      res.status(400)
      res.json({
        error: true,
        msg: "Password does not match please try again",
        status: 400,
      })
    }
    if (body.new_password === body.confirmed_password) {
      bcrypt.genSalt(16, function genSalt(err, salt) {
        if (err) {
          return next(err)
        }
        bcrypt.hash(body.new_password, salt, function hashPasswd(err, hash) {
          if (err) {
            return next(err)
          }
          UserDal.get(
            {
              username: phone,
              reset_password_token: token,
            },
            function getUserByPhone(err, usr) {
              if (!usr._id) {
                res.status(404)
                res.json({
                  error: true,
                  msg: "your request is unidentified",
                  status: 404,
                })
                return
              } else {
                UserDal.update(
                  {
                    _id: usr._id,
                  },
                  {
                    password: hash,
                    updated_at: now,
                    password_changed: true,
                    reset_password_token: undefined,
                    reset_password_expires: undefined,
                  },
                  function resetPass(err, user) {
                    if (err) {
                      return next(err)
                    }
                    res.status(200)
                    res.json({
                      error: false,
                      msg: "You have successfully changed your passsword",
                      status: 200,
                    })
                  }
                )
              }
            }
          )
        })
      })
    }
  }

  static checkPhone(req, res, next) {
    const { body } = req.body
    // const now = new Date()
    req.checkBody("phone").notEmpty().withMessage("Phone should not be Empty")
    UserDal.get(
      {
        username: body.phone,
      },
      function getUserByPhone(err, usr) {
        if (err) {
          return next(err)
        }
        if (!usr._id) {
          res.status(404)
          res.json({
            error: true,
            msg: "Phone is not registered",
            status: 404,
          })
          return
        } else {
          // Let's create the reset token
          crypto.randomBytes(16, function genToken(err, buff) {
            if (err) {
              return next(err)
            }
            const resetToken = buff.toString("hex")
            const tokenExpires = Date.now() + 3600000 // 1hr
            UserDal.update(
              {
                _id: usr._id,
              },
              {
                reset_password_token: resetToken,
                reset_password_expires: tokenExpires,
              },
              function updateUser(err, usr) {
                if (err) {
                  return next(err)
                }
                res.status(200)
                res.json({
                  error: false,
                  phone: body.phone,
                  token: resetToken,
                  status: 200,
                })
              }
            )
          })
        }
      }
    )
  }

  static forgotPassword(req, res, next) {
    const { body } = req.body
    const resetLinkAddress = settings.PASSWORD_RESET.RESET_LINK_ADDRESS
    // const now = new Date()
    // const token_expires = new Date()
    // token_expires.setDate(now.getDate()+settings.RESET_TOKEN_EXPIRY);

    req
      .checkBody("email")
      .notEmpty()
      .withMessage("Email should not be Empty")
      .isEmail()
      .withMessage("Should be valid email")

    UserDal.get(
      {
        username: body.email,
      },
      function getUserByEmail(err, usr) {
        if (err) {
          return next(err)
        }
        if (!usr._id) {
          res.status(404)
          res.json({
            error: true,
            msg: "Email is not registered",
            status: 404,
          })
          return
        } else {
          // Let's create the reset token
          crypto.randomBytes(16, function genToken(err, buff) {
            if (err) {
              return next(err)
            }
            const resetToken = buff.toString("hex")
            const tokenExpires = Date.now() + 3600000 // 1hr
            UserDal.update(
              {
                _id: usr._id,
              },
              {
                reset_password_token: resetToken,
                reset_password_expires: tokenExpires,
              },
              function updateUser(err, usr) {
                if (err) {
                  return next(err)
                }
              }
            )

            //     // Send Email to CLient
            //     //console.log("user found "+body.email);
            // let transporter = nodemailer.createTransport({
            //     host: settings.MAIL_HOST,
            //     port: 587,
            //     secure:false,

            //     auth: {
            //       user: settings.MAIL_USER,
            //       pass: settings.MAIL_PASSWD
            //     },
            //     //to send from outside domain (e.g. local)
            //     tls: {
            //         rejectUnauthorized: false
            //     }
            // });
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                enable_starttls_auto: true,
                user: "", // sender email address
                pass: "", // sender password
              },
            })

            // setup email data with unicode symbols
            const mailOptions = {
              from: "", // sender email address

              // from: settings.MAIL_USER, // sender address
              to: body.email, // reciever
              subject: "Reset Request for forgotten password",
              html: `<h3>password recovery </h3>
                <p> please click on (or copy and paste) the link below to reset your password</p>
                ${resetLinkAddress}?email=${body.email}&token=${resetToken}
                <p> you recieved this email because you requested to reset your forgotten password!</p>
                <p>If you have not sent this you can just ignore this and continue with your current password! Thank you! </p>`,
            }
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                res.json(error)
              } else {
                res.status(200)
                res.json({
                  error: false,
                  msg: "SUCESSFULLY SENT",
                  status: 200,
                })
              }
            })
          })
        }
      }
    )
  }

  static resetPassword(req, res, next) {
    const now = new Date()
    const { body } = req.body
    const { email } = body.email
    const { token } = body.token

    UserDal.get(
      {
        username: email,
        reset_password_token: token,
        reset_password_expires: {
          $gt: now,
        },
      },
      function getUser(err, usr) {
        if (err) {
          return next(err)
        }
        if (!usr._id) {
          res.json({
            error: true,
            msg: "Password reset token is invalid or expired",
            status: 404,
          })
          return
        } else {
          bcrypt.genSalt(16, function genSalt(err, salt) {
            if (err) {
              return next(err)
            }
            bcrypt.hash(body.password, salt, function hashPasswd(err, hash) {
              if (err) {
                return next(err)
              }

              const now = moment().toISOString()
              UserDal.update(
                {
                  _id: usr._id,
                },
                {
                  password: hash,
                  updated_at: now,
                  password_changed: true,
                  reset_password_token: undefined,
                  reset_password_expires: undefined,
                },
                function resetPass(err, user) {
                  if (err) {
                    return next(err)
                  } else {
                    res.json({
                      error: false,
                      message: "Password reseted successfully.",
                      status: 200,
                    })
                  }
                }
              )
            })
          })
        }
      }
    )
  }

  static activateCoporateAccount(req, res, next) {
    const now = new Date()
    const { body } = req.body
    const { email } = req.body.email

    UserDal.get(
      {
        username: email,
      },
      function getUser(err, usr) {
        if (err) {
          return next(err)
        }
        if (!usr._id) {
          res.json({
            error: true,
            msg: "User doesn;t exist!!",
            status: 404,
          })
          return
        } else {
          UserDal.update(
            {
              _id: usr._id,
            },
            {
              corporate_activation_status: true,
            },
            function verifyAccount(err, user) {
              if (err) {
                return next(err)
              } else {
                res.json({
                  error: false,
                  message: "Account Activated Successfully.",
                  status: 200,
                })
              }
            }
          )
        }
      }
    )
  }
}

export default UserController
