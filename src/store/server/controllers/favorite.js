import moment from "moment"
import FavoriteDal from "../dal/favorite"
import CustomerDal from "../dal/customers"

class FavoriteController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateFavorite(req, res, next, id) {
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
      FavoriteDal.get({ _id: id }, (err, doc) => {
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
            msg: `Favorite _id ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}
    FavoriteDal.getCollection(
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

  static fetchAll(req, res, next) {
    const options = {}
    FavoriteDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req
      .checkBody("product")
      .notEmpty()
      .withMessage("Product should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    body.customer = req._user.customers
    body.created_at = now
    body.created_by = req._user.customers
    FavoriteDal.getCollection(
      { $and: [{ customer: req._user.customers }, { product: body.product }] },
      {},
      function getAll(err, iFav) {
        if (err) {
          return next(err)
        }
        switch (iFav.length) {
          case 0:
            FavoriteDal.create(body, (err, doc) => {
              if (err) {
                return next(err)
              }
              const options = { $addToSet: { favorite: doc._id } }
              CustomerDal.update(
                { _id: req._user.customers },
                options,
                function updatecommissionpayment(err, cdoc) {
                  if (err) {
                    return next(err)
                  }
                }
              )
              res.status(200).json({ status: 200, msg: "Successful" })
            })
            break
          default:
            FavoriteDal.delete({ _id: iFav[0]._id }, (err, doc) => {
              if (err) {
                return next(err)
              }
              const options = { $pull: { favorite: iFav[0]._id } }
              CustomerDal.update(
                { _id: req._user.customers },
                options,
                function updatecommissionpayment(err, doc) {
                  if (err) {
                    return next(err)
                  }
                }
              )
              res.status(200).json({ status: 200, msg: "Successful removed" })
            })
        }
      }
    )
  }

  static update(req, res, next) {
    const body = req.body
    FavoriteDal.update(
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

  static delete(req, res, next) {
    FavoriteDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      const options = { $pull: { favorite: req.doc._id } }
      res.json(doc)
      CustomerDal.update(
        { _id: req._user.customers },
        options,
        function updatecommissionpayment(err, doc) {
          if (err) {
            return next(err)
          }
        }
      )
    })
  }
}

export default FavoriteController
