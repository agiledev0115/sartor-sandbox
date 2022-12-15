import NotiticationRequest from "../models/notification"
import Customers from "../models/customers"
import Internal from "../models/internal"
import Product from "../models/product"
import Image from "../models/images"
import Order from "../models/order"

const population = [
  {
    path: "orders",
    model: Order,
  },
  {
    path: "customers",
    model: Customers,
  },
  {
    path: "salers",
    model: Internal,
  },
  {
    path: "products",
    model: Product,
    populate: [
      {
        path: "img",
        model: Image,
      },
    ],
  },
]

class NotificationDal {
  constructor() {}

  static get(query, cb) {
    NotiticationRequest.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(rateHelpData, cb) {
    const rateHelpModel = new NotiticationRequest(rateHelpData)

    rateHelpModel.save(function saveNotiticationRequest(err, data) {
      if (err) {
        return cb(err)
      }

      NotificationDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    NotiticationRequest.findOne(query)
      .populate(population)
      .exec(function deleteNotiticationRequest(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        NotiticationRequest.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const opts = {
      new: true,
    }

    NotiticationRequest.updateMany(query, updates, opts)
      .populate(population)
      .exec(function updateNotiticationRequest(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    NotiticationRequest.find(query, {}, opt)
      .sort({ _id: -1 })
      .populate(population)
      .exec(function getNotiticationRequestsCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }

  static async getNotifications(query, opt) {
    try {
      const notifications = await NotiticationRequest.find(query, {}, opt)
      .sort({ _id: -1 })
      .populate(population)
      return notifications
    } catch (error) {
      return Error(error)
    }
  }
}

export default NotificationDal
