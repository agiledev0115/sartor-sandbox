import moment from "moment"
import async from "async"
import NotifiDal from "../dal/notification"

function removeNotification(req, res, next) {
  const current = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  const options = {}
  NotifiDal.getCollection({}, options, function getAll(err, cats) {
    if (err) {
      return next(err)
    }
    async.eachSeries(
      cats,
      (data, callback) => {
        const createdAt = data.created_at
        const deleteID = data._id
        const diffDays = Math.round(Math.abs((current - createdAt) / oneDay))

        if (diffDays > 30) {
          NotifiDal.delete({ _id: deleteID }, (err, doc) => {
            if (err) {
              return next(err)
            }
          })
        } else {
          callback(null)
        }
      },
      function done(err) {
        if (err) {
          return next(err)
        } else {
          // res.json(cats);
        }
      }
    )
  })
}

setInterval(removeNotification, 82800000) // 23hrs

class NotificationController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateNotifi(req, res, next, id) {
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
      NotifiDal.get({ _id: id }, (err, doc) => {
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Notifi _id  ${id} not found`,
          })
        }
      })
    }
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req.checkBody("title").notEmpty().withMessage("Please enter the title")
    req.checkBody("message").notEmpty().withMessage("Please enter the message")
    // training_date
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    body.created_at = now
    body.created_by = req._user._id
    // body.helper = req._user.helper;
    NotifiDal.create(body, (err, save) => {
      if (err) {
        // if there exist a query error like helper but said helpers
        return next(err)
      }
      res.json(save)
    })
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static fetchAll(req, res, next) {
    const options = {}
    NotifiDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static openNotifiedUnreadcustomer(req, res, next) {
    const options = {}
    NotifiDal.update(
      { helper: req._user.customers },
      { is_read: true },
      function updateNotifi(err, doc) {
        if (err) {
          return next(err)
        }
        // res.json(doc);
      }
    )
  }

  static notifiedUnreadcustomer(req, res, next) {
    const options = {}
    const query = {
      $and: [{ customers: req._user.customers, is_read: false, helper: null }],
    }

    NotifiDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      if (Object.keys(cats).length === 0) {
        res.status(404)
        res.json({
          error: true,
          msg: "There are notification for you",
          status: 404,
        })
      } else {
        res.json(cats)
      }
    })
  }

  static notifiedreadcustomer(req, res, next) {
    const options = {}
    const query = {
      $or: [
        { customers: req._user.customers, helper: null },
        { broadcast: true, broadCastType: "helper" },
      ],
    }

    NotifiDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      if (Object.keys(cats).length === 0) {
        res.status(404)
        res.json({
          error: true,
          msg: "There are notification ",
          status: 404,
        })
      } else {
        res.json(cats)
      }
    })
  }

  static listsNotification(req, res, next) {
    const options = {}
    const query = { customers: req._user.customers }
    NotifiDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static broadCastedMessages(req, res, next) {
    const options = {}
    const noCustomerHelper = { customers: null, helper: null, broadcast: true }
    NotifiDal.getCollection(noCustomerHelper, options, function getAll(
      err,
      cats
    ) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static broadCastcustomer(req, res, next) {
    const options = {}

    const query = {
      customers: null,
      helper: null,
      broadcast: true,
      broadCastType: "customers",
    }

    NotifiDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static update(req, res, next) {
    const body = req.body
    NotifiDal.update({ _id: req.doc._id }, body, function updateNotifi(
      err,
      doc
    ) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static deleteNotifi(req, res, next) {
    NotifiDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default NotificationController
