import WishList from "../models/wishlists"
import Product from "../models/product"
import Customer from "../models/customers"

const population = [
  {
    path: "product",
    model: Product,
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

class WishListDal {
  constructor() {}

  static get(query, cb) {
    WishList.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(WishListData, cb) {
    const WishListModel = new WishList(WishListData)

    WishListModel.save(function saveWishList(err, data) {
      if (err) {
        return cb(err)
      }

      WishListDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    WishList.findOne(query)
      .populate(population)
      .exec(function deleteWishList(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        WishList.remove(query, err => {
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

    WishList.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateWishList(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    WishList.find(query, {}, opt)
      .populate(population)
      .exec(function getWishListsCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default WishListDal
