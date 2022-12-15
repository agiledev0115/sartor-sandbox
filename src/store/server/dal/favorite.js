import moment from "moment"
import Favorite from "../models/favorite"
import Product from "../models/product"
import Customer from "../models/customers"
import Images from "../models/images"

const population = [
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
  {
    path: "customer",
    model: Customer,
  },
  {
    path: "created_by",
    model: Customer,
    populate: [
      {
        path: "user",
        select: "-password -role -username -customers",
      },
    ],
  },
]

class FavoriteDal {
  constructor() {}

  static get(query, cb) {
    Favorite.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(FavoriteData, cb) {
    const FavoriteModel = new Favorite(FavoriteData)

    FavoriteModel.save(function saveFavorite(err, data) {
      if (err) {
        return cb(err)
      }

      FavoriteDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Favorite.findOne(query)
      .populate(population)
      .exec(function deleteFavorite(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Favorite.remove(query, err => {
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

    Favorite.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateFavorite(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Favorite.find(query, {}, opt)
      .populate(population)
      .exec(function getFavoritesCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default FavoriteDal
