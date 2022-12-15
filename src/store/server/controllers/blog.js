import moment from "moment"
import settings from "../../../../config/server"
import BlogDal from "../dal/blog"
import fs from "fs"

function removePicture(picUrl, callback) {
  fs.unlink(`${settings.MEDIA.UPLOADES}${picUrl}`, err => {
    callback()
  })
}

class BlogController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateBlog(req, res, next, id) {
    //  Validate the id is mongoid or not
    req.checkParams("id", "Invalid param").isMongoId(id)
    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(404).json({
        error: true,
        message: "Not Found",
        status: 404,
      })
    } else {
      BlogDal.get({ _id: id }, (err, doc) => {
        if (err) {
          return next(err)
        }
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Blog _id ${id} not found`,
          })
        }
      })
    }
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static fetchAll(req, res, next) {
    const options = {}
    BlogDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static view(req, res, next) {
    const options = {}
    const query = { created_by: req._user._id }
    switch (req._user.role) {
      case "salers":
        BlogDal.getCollection(query, options, function getAll(err, cats) {
          if (err) {
            return next(err)
          }
          res.json(cats)
        })
        break
      default:
        res.status(400).status({
          error: true,
          msg: "You are not authorized to view",
          status: 400,
        })
        break
    }
  }

  static update(req, res, next) {
    const body = req.body

    BlogDal.update({ _id: req.doc._id }, body, function updateBlog(err, doc) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static searchBlog(req, res, next) {
    const body = req.body
    const searchQuery = {
      $or: [
        {
          title: new RegExp(body.search, "i"),
        },
        {
          story: new RegExp(body.search, "i"),
        },
      ],
    }
    const options = {}

    BlogDal.getCollection(searchQuery, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req.checkBody("title").notEmpty().withMessage("Name should not be empty")
    req.checkBody("story").notEmpty().withMessage("Store should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }

    body.created_at = now
    body.created_by = req._user._id
    if (!req.files[0]) {
      res.status(400)
      res.json({
        msg: "File is not passed",
      })
      return
    }
    const dest1 = `${process.swd()}/public/sartor/uploads/
    ${req.files[0].filename}`
    body.image = dest1

    BlogDal.create(body, (err, idoc) => {
      if (err) {
        return next(err)
      }
      res.status(200).json(idoc)
    })
  }

  static delete(req, res, next) {
    BlogDal.delete({ _id: req.doc._id }, (err, idoc) => {
      if (err) {
        return next(err)
      }
      if (idoc.image) {
        removePicture(idoc.image, () => {})
      }
      res.json(idoc)
    })
  }
}

export default BlogController
