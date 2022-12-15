import SalersDal from "../dal/salers"

class SalersController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateSalers(req, res, next, id) {
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
      SalersDal.get({ _id: id }, (err, doc) => {
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Salers _id ${id} not found`,
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
    SalersDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }

      res.json(cats)
    })
  }

  static update(req, res, next) {
    const body = req.body
    SalersDal.update({ _id: req.doc._id }, body, function updateCategory(
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
    // uploading a picture of the category is finished
    SalersDal.update({ _id: req.doc._id }, body, function updateCategory(
      err,
      doc
    ) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static delete(req, res, next) {
    SalersDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default SalersController
