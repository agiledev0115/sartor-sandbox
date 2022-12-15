import moment from "moment"
import Customer from "../models/customers"
import OrderBackup from "../models/orderbackup"
import Internal from "../models/internal"
import Product from "../models/product"

const population = [
  {
    path: "customer",
    model: Customer,
  },
  {
    path: "product",
    model: Product,
  },
]

class OrderBackupDal {
  constructor() {}

  static get(query, cb) {
    OrderBackup.findOne(query).exec((err, doc) => {
      if (err) {
        return cb(err)
      }

      cb(null, doc || {})
    })
  }

  static create(OrderData, cb) {
    const searchQuery = {
      username: OrderData.username,
    }
    const OrderModel = new OrderBackup(OrderData)

    OrderModel.save(function SaveOrder(err, data) {
      if (err) {
        return cb(err)
      }

      OrderBackupDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    OrderBackup.findOne(query)
      .populate(population)
      .exec(function deleteOrder(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        OrderBackup.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()

    OrderBackup.findOneAndUpdate(query, updates, {}).exec((err, cust) => {
      if (err) {
        return cb(err)
      }
      cb(null, cust || {})
    })
  }

  static getCollection(query, qs, cb) {
    OrderBackup.find(query, {}, qs)
      .sort({ _id: -1 })
      .populate(population)
      .exec(function getOrderCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default OrderBackupDal
