import Sales from "../models/sales"
import Product from "../models/product"
import Customer from "../models/customers"
import Brand from "../models/brands"
import Checkout from "../models/checkout"
import Image from "../models/images"

const population = [
  {
    path: "products",
    model: Product,
    populate: [
      {
        path: "brands",
        model: Brand,
      },
      {
        path: "img",
        model: Image,
      },
    ],
  },
  {
    path: "brands",
    model: Brand,
  },
  {
    path: "customer",
    model: Customer,
  },
  {
    path: "checkouts",
    model: Checkout,
  },
  {
    path: "created_by",
    select: "-password",
  },
]

class SalesDal {
  constructor() {}

  static get(query, cb) {
    Sales.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(SalesData, cb) {
    const SalesModel = new Sales(SalesData)

    SalesModel.save(function saveSales(err, data) {
      if (err) {
        return cb(err)
      }

      SalesDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Sales.findOne(query)
      .populate(population)
      .exec(function deleteSales(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Sales.remove(query, err => {
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

    Sales.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateSales(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Sales.find(query, {}, opt)
      .populate(population)
      .exec(function getSalessCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default SalesDal
