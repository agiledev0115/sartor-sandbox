import moment from "moment"
import Customer from "../models/customers"
import Order from "../models/order"
import TimeLine from "../models/timeline"

const population = [
  {
    path: "customer",
    model: Customer,
  },
]

class TimeLineDal {
  constructor() {}

  static get(query, cb) {
    TimeLine.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(TimeLineData, cb) {
    const TimeLineModel = new TimeLine(TimeLineData)

    TimeLineModel.save(function SaveOrder(err, data) {
      if (err) {
        return cb(err)
      }

      TimeLineDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    TimeLine.findOne(query)
      .populate(population)
      .exec(function deleteOrder(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        TimeLine.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()

    TimeLine.findOneAndUpdate(query, updates, {}).exec((err, cust) => {
      if (err) {
        return cb(err)
      }
      cb(null, cust || {})
    })
  }

  static getCollection(query, qs, cb) {
    TimeLine.find(query, {}, qs)
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

export default TimeLineDal
