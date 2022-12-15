import moment from "moment"
import WishListDal from "../dal/wishlists"

class WishListController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateWishList(req, res, next, id) {
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
      WishListDal.get({ _id: id }, (err, doc) => {
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
            msg: `Wishlist _id  ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}
    WishListDal.getCollection(
      { customer: req._user.customer },
      options,
      function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        res.json(cats)
      }
    )
  }

  static fetchAll(req, res, next) {
    const options = {}
    WishListDal.getCollection({}, options, function getAll(err, cats) {
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
    WishListDal.update(
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
    req
      .checkBody("product")
      .notEmpty()
      .withMessage(" Product should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    body.customer = req._user.customer
    body.created_at = now
    body.created_by = req._user._id
    WishListDal.create(body, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static delete(req, res, next) {
    WishListDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default WishListController
