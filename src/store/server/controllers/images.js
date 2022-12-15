import moment from "moment"
import ImageDal from "../dal/images"

class ImagesController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateImage(req, res, next, id) {
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
      ImageDal.get({ _id: id }, (err, doc) => {
        if (err) {
          return next(err)
        }
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Image _id ${id} not found`,
          })
        }
      })
    }
  }

  static fetchAll(req, res, next) {
    const options = {}
    ImageDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static update(req, res, next) {
    const body = req.body
    ImageDal.update(
      { _id: req.doc._id },
      body,
      function updatecommissionpayment(err, doc) {
        if (err) {
          return next(err)
        }
        res.json(doc)
      }
    )
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req.checkBody("name").notEmpty().withMessage(" Name should not be empty")
    req.checkBody("store").notEmpty().withMessage("Store should not be empty")
    req.checkBody("price").notEmpty().withMessage("Price Should not be empty")
    req
      .checkBody("category")
      .notEmpty()
      .withMessage("Category needs to be filled")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    const dest = `uploads/${req.files[0].filename}`
    body.img = dest
    body.created_at = now
    body.created_by = req._user._id
    ImageDal.create(body, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static delete(req, res, next) {
    ImageDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default ImagesController
