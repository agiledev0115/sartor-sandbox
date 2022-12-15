import Product from "../models/product"
import Category from "../models/category"
import Brand from "../models/brands"
import Images from "../models/images"
import Internal from "../models/internal"

const population = [
  {
    path: "catagory",
    model: Category,
  },
  {
    path: "img",
    model: Images,
  },
  {
    path: "brands",
    model: Brand,
  },
  {
    path: "created_by",
    select: "-password",
    populate: [
      {
        path: "internal",
        model: Internal,
      },
    ],
  },
]

class ProductDal {
  constructor() {}

  static get(query, cb) {
    Product.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(ProductData, cb) {
    const ProductModel = new Product(ProductData)

    ProductModel.save(function saveProduct(err, data) {
      if (err) {
        return cb(err)
      }

      ProductDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Product.findOne(query)
      .populate(population)
      .exec(function deleteProduct(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Product.remove(query, err => {
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

    Product.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateProduct(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Product.find(query, {}, opt)
      .sort({ _id: -1 })
      .populate(population)
      .exec(function getProductsCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default ProductDal
