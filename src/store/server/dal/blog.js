import moment from "moment"
import Blog from "../models/blog"

const population = [
  {
    path: "created_by",
    select: "-password",
  },
]

class BlogDal {
  constructor() {}

  static get(query, cb) {
    Blog.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(BlogData, cb) {
    const BlogModel = new Blog(BlogData)
    BlogModel.save(function saveBlog(err, data) {
      if (err) {
        return cb(err)
      }
      BlogDal.get({ _id: data.id }, (err, doc) => {
        if (err) {
          return cb(err)
        }
        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Blog.findOne(query)
      .populate(population)
      .exec(function deleteBlog(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Blog.remove(query, err => {
          if (err) {
            return cb(err)
          }
          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()
    const opts = { new: true, useFindAndModify: false }
    const update = { _id: query }

    Blog.findOneAndUpdate(update, updates, opts)
      .populate(population)
      .exec(function updateBlog(err, doc) {
        if (err) {
          return cb(err)
        }
        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Blog.find(query, {}, opt)
      .sort({ _id: -1 })
      .populate(population)
      .exec(function getBlogsCollection(err, doc) {
        if (err) {
          return cb(err)
        }
        return cb(null, doc)
      })
  }
}

export default BlogDal
