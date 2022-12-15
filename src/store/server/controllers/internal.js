import moment from "moment"
import InternalDal from "../dal/internal"
import UserDal from "../dal/user"

class InternalController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateInternal(req, res, next, id) {
    req.checkParams("id", "Invalid param").isMongoId(id)
    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(404).json({
        error: true,
        message: "Wrong ID is Passed",
        status: 404,
      })
    } else {
      InternalDal.get({ _id: id }, (err, doc) => {
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Internal _id ${id} not found`,
          })
        }
      })
    }
  }

  static createInternal(req, res, next) {
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

    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }

    const now = moment().toISOString()
    const body = req.body
    body.created_at = now
    InternalDal.create(body, function createInternal(err, doc) {
      if (err) {
        return next(err)
      }
      res.json({})
    })
  }

  static updateInternal(req, res, next) {
    const body = req.body
    InternalDal.update({ _id: req.doc._id }, body, function updateAd(err, doc) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static getInternal(req, res, next) {
    res.json(req.doc)
  }

  static getInternals(req, res, next) {
    const options = {}
    InternalDal.getCollection({}, options, (err, docs) => {
      if (err) {
        return next(err)
      }
      res.json(docs)
    })
  }

  static uploadProfile(req, res, next) {
    const dest = `uploads/${req.files[0].filename}`

    InternalDal.update(
      { _id: req._user.internal },
      { picture: dest },
      (err, doc) => {
        // helperDal.update({ _id: req._user }, { picture: dest }, (err, doc) => {
        if (err) {
          return next(err)
        }
        res.status(200)
        res.json({
          error: false,
          upload: "Success",
          status: 200,
        })
      }
    )
  }

  static deleteInternal(req, res, next) {
    InternalDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      UserDal.delete({ _id: req.doc.user }, (err, doc) => {
        if (err) {
          return next(err)
        }
        // res.json(doc);
      })
      res.json(doc)
    })
  }
}

export default InternalController
