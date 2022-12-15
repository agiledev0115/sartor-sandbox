import moment from "moment"
import Customers from "../models/customers"
import Favorite from "../models/favorite"
import Review from "../models/review"
import Product from "../models/product"
import Images from "../models/images"

const returnFields = Customers.whitelist
const population = [
  {
    path: "user",
    select: "-password",
  },
  {
    path: "favorite",
    model: Favorite,
    populate: [
      {
        path: "product",
        model: Product,
        populate: [
          {
            path: "img",
            model: Images,
          },
        ],
      },
    ],
  },
  {
    path: "reviews",
    model: Review,
    populate: [
      {
        path: "product",
        model: Product,
      },
    ],
  },
]

class CustomersDal {
  constructor() {}

  static get(query, cb) {
    Customers.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(CustomersData, cb) {
    const searchQuery = {
      username: CustomersData.username,
    }
    const CustomersModel = new Customers(CustomersData)

    CustomersModel.save(function saveCustomers(err, data) {
      if (err) {
        return cb(err)
      }

      CustomersDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Customers.findOne(query, returnFields)
      .populate(population)
      .exec(function deleteUser(err, Customers) {
        if (err) {
          return cb(err)
        }

        if (!Customers) {
          return cb(null, {})
        }

        Customers.remove(err => {
          if (err) {
            return cb(err)
          }

          cb(null, Customers)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()
    const opts = {
      select: returnFields,
    }

    Customers.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec((err, cust) => {
        if (err) {
          return cb(err)
        }
        cb(null, cust || {})
      })
  }

  static getCollection(query, qs, cb) {
    Customers.find(query, {}, qs)
      .sort({ _id: -1 })
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }
}

export default CustomersDal
