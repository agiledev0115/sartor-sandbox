import moment from "moment"
import Checkout from "../models/checkout"
import Customer from "../models/customers"

const population = [
  {
    path: "created_by",
    select: "-password",
    populate: [
      {
        path: "customers",
        model: Customer,
        select: "-user",
      },
    ],
  },
]

class CheckoutDal {
  constructor() {}

  static get(query, cb) {
    Checkout.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(CheckoutData, cb) {
    const CheckoutModel = new Checkout(CheckoutData)

    CheckoutModel.save(function saveCheckout(err, data) {
      if (err) {
        return cb(err)
      }

      CheckoutDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Checkout.findOne(query)
      .populate(population)
      .exec(function deleteCheckout(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Checkout.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()
    const opts = {
      new: true,
    }

    Checkout.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateCheckout(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Checkout.find(query, {}, opt)
      .populate(population)
      .exec(function getCheckoutsCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default CheckoutDal
