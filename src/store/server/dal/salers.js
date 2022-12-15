import Salers from "../models/salers"
import Favorite from "../models/favorite"
import Review from "../models/review"

const returnFields = Salers.whitelist
const population = [
  {
    path: "user",
    select: "-password",
  },
  {
    path: "favorite",
    model: Favorite,
  },
  {
    path: "reviews",
    model: Review,
  },
]

class SalersDal {
  constructor() {}

  static get(query, cb) {
    Salers.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(SalersData, cb) {
    const searchQuery = { username: SalersData.username }
    const SalersModel = new Salers(SalersData)

    SalersModel.save(function saveSalers(err, data) {
      if (err) {
        return cb(err)
      }

      SalersDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Salers.findOne(query, returnFields)
      .populate(population)
      .exec(function deleteUser(err, Salers) {
        if (err) {
          return cb(err)
        }

        if (!Salers) {
          return cb(null, {})
        }

        Salers.remove(err => {
          if (err) {
            return cb(err)
          }

          cb(null, Salers)
        })
      })
  }

  static update(query, updates, cb) {
    const opts = {
      new: true,
      safe: true,
      upsert: true,
      select: returnFields,
    }

    Salers.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateUser(err, Salers) {
        if (err) {
          return cb(err)
        }

        cb(null, Salers || {})
      })
  }

  static getCollection(query, qs, cb) {
    Salers.find(query, {}, qs)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }
}

export default SalersDal
