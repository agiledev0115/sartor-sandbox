import moment from "moment"
import SalesDal from "../dal/sales"

class SalesController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateSales(req, res, next, id) {
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
      SalesDal.get({ _id: id }, (err, doc) => {
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
            msg: `Sales _id ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}

    SalesDal.getCollection(
      { created_by: req._user._id },
      options,
      function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        switch (cats.length) {
          case 0:
            res.json(cats)
            break
          default:
            res.status(200).json(cats)
        }
      }
    )
  }

  static fetchAll(req, res, next) {
    const options = {}
    SalesDal.getCollection({}, options, function getAll(err, cats) {
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
    SalesDal.update(
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
    body.customer = req._user.customers
    body.created_at = now
    body.created_by = req._user._id
    SalesDal.create(body, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static delete(req, res, next) {
    SalesDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default SalesController
