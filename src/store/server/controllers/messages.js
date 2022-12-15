import moment from "moment"
import MessagesDal from "../dal/messages"
import SalersDal from "../dal/salers"

class MessageController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateMessage(req, res, next, id) {
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
      MessagesDal.get({ _id: id }, (err, doc) => {
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
            msg: `Message _id  ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}
    MessagesDal.getCollection(
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

  static unreadMessages(req, res, next) {
    const options = {}
    const query = {
      $and: [{ customer: req._user.customers }, { is_readCustomer: false }],
    }
    MessagesDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static fetchAll(req, res, next) {
    const options = {}
    MessagesDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static fetchOne(req, res, next) {
    const updateQuery = { is_readCustomer: true }
    MessagesDal.update(
      { _id: req.doc._id },
      updateQuery,
      function updatecommissionpayment(err, doc) {
        if (err) {
          return next(err)
        }
      }
    )
    res.json(req.doc)
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req
      .checkBody("message")
      .notEmpty()
      .withMessage("message should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    body.created_at = now
    body.created_by = req._user._id
    SalersDal.get({ brands: body.brands }, function getAll(err, iSaler) {
      if (err) {
        return next(err)
      }
      const query = {
        $and: [
          { customer: req._user.customers },
          { salers: iSaler._id },
          { brands: body.brands },
        ],
      }
      const options = {}
      MessagesDal.getCollection(query, options, function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        switch (Object.keys(cats).length) {
          case 0:
            req
              .checkBody("salers")
              .notEmpty()
              .withMessage("Salers id must be requried")
            req
              .checkBody("brands")
              .notEmpty()
              .withMessage("brands must be requried")
            body.customer = req._user.customers
            MessagesDal.create(body, (err, save) => {
              if (err) {
                // if there exist a query error like helper but said helpers
                return next(err)
              }
              res.json(save)
            })
            break
          default:
            MessagesDal.getCollection(query, options, function getAll(
              err,
              iLastRecord
            ) {
              if (err) {
                return next(err)
              }
              const lastid = iLastRecord.length - 1
              body.reply = iLastRecord[lastid]._id
              body.customer = iLastRecord[0].customer._id
              body.salers = iLastRecord[0].salers._id
              MessagesDal.create(body, (err, save) => {
                if (err) {
                  // if there exist a query error like helper but said helpers
                  return next(err)
                }
                res.json(save)
              })
            })
        }
      })
    })
  }

  static update(req, res, next) {
    const body = req.body
    MessagesDal.update(
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
    MessagesDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      const options = { $pull: { favorite: req.doc._id } }
      res.json(doc)
    })
  }
}

export default MessageController
