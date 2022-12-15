import moment from "moment"
import settings from "../../../../config/server"
import ProductDal from "../dal/product"
import ImageDal from "../dal/images"
import fs from "fs"

function removePicture(picUrl, callback) {
  fs.unlink(settings.MEDIA.UPLOADS + picUrl, err => {
    callback()
  })
}

class ProductController {
  constructor() {}

  static oop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateProduct(req, res, next, id) {
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
      ProductDal.get({ _id: id }, (err, doc) => {
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
            msg: `Product _id ${id} not found`,
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
    ProductDal.getCollection({}, options, function getAll(err, cats) {
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
        ProductDal.getCollection(query, options, function getAll(err, cats) {
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
    }
  }

  static update(req, res, next) {
    const body = req.body
    ProductDal.update(
      { _id: req.doc._id },
      body,
      function updatecommissionpayment(err, doc) {
        if (err) {
          return next(err)
        }
        res.json(doc)
      }
    )
  }

  static searchProduct(req, res, next) {
    const body = req.body

    const searchQuery = {
      $or: [
        { name: new RegExp(body.search, "i") },
        { store: new RegExp(body.search, "i") },
        { description: new RegExp(body.search, "i") },
      ],
    }
    const options = {}
    ProductDal.getCollection(searchQuery, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req.checkBody("name").notEmpty().withMessage(" Name should not be empty")
    req.checkBody("store").notEmpty().withMessage("Store should not be empty")
    req.checkBody("price").notEmpty().withMessage("Price Should not be empty")
    req
      .checkBody("category")
      .notEmpty()
      .withMessage("Category needs to be filled")
    req.checkBody("brands").notEmpty().withMessage("Brand must be selected")
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
    } else {
      const dest1 = `uploads/${req.files[0].filename}`
      const dest2 = `uploads/${req.files[1].filename}`
      const dest3 = `uploads/${req.files[2].filename}`
      const dest4 = `uploads/${req.files[3].filename}`
      const dest5 = `uploads/${req.files[4].filename}`
      const dest6 = `uploads/${req.files[5].filename}`
      const dest7 = `uploads/${req.files[6].filename}`
      const dest8 = `uploads/${req.files[7].filename}`
      body.img0 = dest1
      body.img1 = dest8
      body.img2 = dest2
      body.img3 = dest3
      body.img4 = dest4
      body.img5 = dest5
      body.img6 = dest6
      body.img7 = dest7
    }
    ImageDal.create(body, (err, idoc) => {
      if (err) {
        return next(err)
      }
      body.img = idoc._id
      ProductDal.create(body, (err, pdoc) => {
        if (err) {
          return next(err)
        }
        res.json(pdoc)
      })
    })
  }

  static delete(req, res, next) {
    ProductDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      ImageDal.delete({ _id: doc.img0 }, (err, idoc) => {
        if (err) {
          return next(err)
        }
        if (idoc.img0) {
          removePicture(idoc.img, () => {})
        }
        if (idoc.img2) {
          removePicture(idoc.img2, () => {})
        }
        if (idoc.img3) {
          removePicture(idoc.img3, () => {})
        }
        if (idoc.img4) {
          removePicture(idoc.img4, () => {})
        }
        if (idoc.img5) {
          removePicture(idoc.img5, () => {})
        }
        if (idoc.img6) {
          removePicture(idoc.img6, () => {})
        }
        if (idoc.img7) {
          removePicture(idoc.img7, () => {})
        }
        if (idoc.img1) {
          removePicture(idoc.img1, () => {})
        }
      })
      res.json(doc)
    })
  }
}

export default ProductController
