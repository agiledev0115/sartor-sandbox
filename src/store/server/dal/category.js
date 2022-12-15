import moment from "moment"
import Category from "../models/category"

const population = [
  {
    path: "created_by",
    select: "-password",
  },
]

class CategoryDal {
  constructor() {}

  static get(query, cb) {
    Category.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(categoryData, cb) {
    const categoryModel = new Category(categoryData)

    categoryModel.save(function saveCategory(err, data) {
      if (err) {
        return cb(err)
      }

      CategoryDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Category.findOne(query)
      .populate(population)
      .exec(function deleteCategory(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Category.remove(query, err => {
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

    Category.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateCategory(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Category.find(query, {}, opt)
      .sort({ name: 1 })
      .populate(population)
      .exec(function getcategorysCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default CategoryDal
