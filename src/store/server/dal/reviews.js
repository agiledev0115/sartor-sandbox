import Reviews from "../models/review"
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

class ReviewsDal {
  constructor() {}

  static get(query, cb) {
    Reviews.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(ReviewsData, cb) {
    const ReviewsModel = new Reviews(ReviewsData)

    ReviewsModel.save(function saveReviews(err, data) {
      if (err) {
        return cb(err)
      }

      ReviewsDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Reviews.findOne(query)
      .populate(population)
      .exec(function deleteReviews(err, doc) {
        if (err) {
          return cb(err)
        }
        if (!doc) {
          return cb(null, {})
        }
        Reviews.remove(query, err => {
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

    Reviews.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateReviews(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Reviews.find(query, {}, opt)
      .populate(population)
      .exec(function getReviewssCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default ReviewsDal
