import moment from "moment"
import CartsDal from "../dal/carts"
import ProductDal from "../dal/product"
import SalesDal from "../dal/sales"

function thousandsSeparators(num) {
  const numParts = num.toString().split(".")
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return numParts.join(".")
}

class CartsController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateCarts(req, res, next, id) {
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
      CartsDal.get({ _id: id }, (err, doc) => {
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
            msg: `Cart _id ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}
    CartsDal.getCollection(
      { customer: req._user.customers },
      options,
      function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        let result = 0
        let pname
        let btitle
        let catego
        let i = 0
        let countMany
        switch (cats.length) {
          case 0:
            res.json(cats)
            break
          default:
            for (i = 0; i < cats.length; i++) {
              countMany = cats.indexOf(cats[i].product._id)
            }
            cats.forEach(element => {
              pname = element.product.name
              btitle = element.product.brands.title
              catego = element.product.category.name
              result += element.product.price
            })
            res.json({
              data: cats,
              total: thousandsSeparators(result),
            })
        }
      }
    )
  }

  static fetchAll(req, res, next) {
    const options = {}
    CartsDal.getCollection({}, options, function getAll(err, cats) {
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
    CartsDal.update(
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
    const options = {}
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
    ProductDal.get({ _id: body.product }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      SalesDal.getCollection({ products: cats._id }, options, function getAll(
        err,
        iSales
      ) {
        if (err) return next(err)
        const difference = cats.qty - iSales.length
        if (difference > 0) {
          body.customer = req._user.customers
          body.created_at = now
          body.created_by = req._user._id
          CartsDal.create(body, (err, doc) => {
            if (err) {
              return next(err)
            }
            res.json(doc)
          })
        } else if (difference <= 0) {
          res.json(400).json({
            error: true,
            msg: "There are no stock for this item",
            status: 400,
          })
        }
      })
    })
  }

  static delete(req, res, next) {
    CartsDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default CartsController
