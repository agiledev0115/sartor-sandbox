import moment from "moment"
import ReviewDal from "../dal/reviews"
import CustomerDal from "../dal/customers"
import InternalDal from "../dal/internal"
import NotifiDal from "../dal/notification"

class ReviewsController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateReviews(req, res, next, id) {
    //  Validate the id is mongoid or not
    req.checkParams("id", "Invalid param").isMongoId(id)
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(404).json({
        error: true,
        message: "Not Found",
        status: 404,
      })
    } else {
      ReviewDal.get({ _id: id }, (err, doc) => {
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
            msg: `Review _id ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}
    ReviewDal.getCollection(
      { customer: req._user.customers },
      options,
      function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        res.json(cats)
      }
    )
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static fetchAll(req, res, next) {
    const options = {}
    ReviewDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static update(req, res, next) {
    const body = req.body
    ReviewDal.update(
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
    req
      .checkBody("review")
      .notEmpty()
      .withMessage(" Comment should not be empty")
    req.checkBody("rate").notEmpty().withMessage(" Rate should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    if (!req.files[0]) {
      res.status(400)
      res.json({
        msg: "File is not passed",
      })
      return
    } else {
      const dest1 = `uploads/${req.files[0].filename}`
      body.img = dest1
    }
    body.customer = req._user.customers
    body.created_at = now
    body.created_by = req._user.customers
    ReviewDal.create(body, (err, doc) => {
      if (err) {
        return next(err)
      }
      const options = { $addToSet: { reviews: doc._id } }
      CustomerDal.update(
        { _id: req._user.customers },
        options,
        function updatecommissionpayment(err, idoc) {
          if (err) {
            return next(err)
          }
        }
      )
      InternalDal.get({ brands: doc.product.brands }, function showSalers(
        err,
        internalDoc
      ) {
        if (err) {
          return next(err)
        }
        const itemQury = {
          title: "Your Product was Reviewed",
          message: `${doc.customer.full_name} has made a review on your product ${doc.product.name}. Please go to your product section and view what was commented on. <BR> <img src="'${doc.img}'" style="width: 55px; margin-right: 12px;"/> ${doc.review}`,
          salers: internalDoc._id,
          created_at: now,
          created_by: req._user.customers,
          is_read: false,
          products: doc.product._id,
        }
        NotifiDal.create(itemQury, (err, notDoc) => {
          if (err) {
            return next(err)
          }
          console.log(notDoc)
        })
      })
      res.json(doc)
    })
  }

  static searchReview(req, res, next) {
    const body = req.body
    const searchQuery = body.search
    const options = {}
    ReviewDal.getCollection(searchQuery, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static delete(req, res, next) {
    ReviewDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      const options = { $pull: { reviews: req.doc._id } }
      CustomerDal.update(
        { _id: req._user.customers },
        options,
        function updatecommissionpayment(err, doc) {
          if (err) {
            return next(err)
          }
        }
      )
      res.json(doc)
    })
  }
}

export default ReviewsController
