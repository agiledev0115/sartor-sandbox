import moment from "moment"
import CategoryDal from "../dal/category"

class CategoryController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateCategory(req, res, next, id) {
    // Validate the id is mongoid or not
    req.checkParams("id", "Invalid param").isMongoId(id)

    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(404).json({
        error: true,
        message: "Not Found",
        status: 404,
      })
    } else {
      CategoryDal.get({ _id: id }, (err, doc) => {
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Catgeory _id ${id} not found`,
          })
        }
      })
    }
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req
      .checkBody("name")
      .notEmpty()
      .withMessage("Category name should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }

    body.created_at = now
    body.created_by = req._user._id
    CategoryDal.get({ name: body.name }, (err, cat) => {
      if (err) {
        return next(err)
      }
      if (cat._id) {
        res.status(400)
        res.json({ error: true, msg: "Category already exists", status: 400 })
        return
      }
      CategoryDal.create(body, (err, doc) => {
        if (err) {
          return next(err)
        }
        res.json(doc)
      })
    })
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static fetchAll(req, res, next) {
    const options = {}
    CategoryDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }

      res.json(cats)
    })
  }

  static update(req, res, next) {
    const body = req.body

    CategoryDal.update({ _id: req.doc._id }, body, function updateCategory(
      err,
      doc
    ) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static updatePicture(req, res, next) {
    const body = req.body
    const dest1 = `uploads/${req.files[0].filename}`

    req.body.picture = dest1

    /** uploading a picture of the category is finished */
    CategoryDal.update({ _id: req.doc._id }, body, function updateCategory(
      err,
      doc
    ) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static deleteCategory(req, res, next) {
    CategoryDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default CategoryController
