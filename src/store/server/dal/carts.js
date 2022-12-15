import moment from "moment"
import Carts from "../models/cart"
import Product from "../models/product"
import Customer from "../models/customers"
import Brand from "../models/brands"
import Category from "../models/category"

const population = [
  {
    path: "product",
    model: Product,
    populate: [
      {
        path: "brands",
        model: Brand,
      },
      {
        path: "category",
        model: Category,
      },
    ],
  },
  {
    path: "customer",
    model: Customer,
  },
  {
    path: "created_by",
    select: "-password",
  },
]

class CartsDal {
  constructor() {}

  static get(query, cb) {
    Carts.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(CartsData, cb) {
    const CartsModel = new Carts(CartsData)

    CartsModel.save(function saveCarts(err, data) {
      if (err) {
        return cb(err)
      }

      CartsDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Carts.findOne(query)
      .populate(population)
      .exec(function deleteCarts(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Carts.remove(query, err => {
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

    Carts.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateCarts(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Carts.find(query, {}, opt)
      .populate(population)
      .exec(function getCartssCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default CartsDal
