import moment from "moment"
import settings from "../../../../config/server"
import BrandsDal from "../dal/brands"
import InternalDal from "../dal/internal"
import ShowCaseDal from "../dal/showcase"
import ProductDal from "../dal/product"
import MessageDal from "../dal/messages"
import SalesDal from "../dal/sales"
import UserDal from "../dal/user"
import fs from "fs"

function removePicture(picUrl, callback) {
  fs.unlink(settings.MEDIA.UPLOADS + picUrl, err => {
    callback()
  })
}

class BrandController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateBrands(req, res, next, id) {
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
      BrandsDal.get({ _id: id }, (err, doc) => {
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
            msg: `Brand _id ${id} not found`,
          })
        }
      })
    }
  }

  static fetchAll(req, res, next) {
    const options = {}
    BrandsDal.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static topBrands(req, res, next) {
    const query = { is_top: true }
    const options = {}
    BrandsDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static products(req, res, next) {
    const query = { brands: req.doc._id }
    ProductDal.getCollection(query, {}, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static sales(req, res, next) {
    const query = { _id: req.doc.products.brands._id }
    const options = {}
    SalesDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static fetchOne(req, res, next) {
    const options = {}
    InternalDal.get({ brands: req.doc._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      ShowCaseDal.getCollection(
        { brand: req.doc._id },
        options,
        function getAll(err, iShows) {
          if (err) {
            return next(err)
          }
          res.status(200).json({
            data: req.doc,
            about: cats.descriptions,
            videos: cats.videos,
            showCase: iShows,
          })
        }
      )
    })
  }

  static update(req, res, next) {
    const body = req.body
    BrandsDal.update(
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

  static follow(req, res, next) {
    const customer = req._user.customers
    const follow = { $addToSet: { followers: customer } }
    const unfollow = { $pull: { followers: customer } }

    BrandsDal.get({ _id: req.doc._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }

      const checkUser = cats.followers.indexOf(customer)
      let savedCustomer = null

      switch (cats.followers.length) {
        case 0:
          BrandsDal.update(
            { _id: req.doc._id },
            follow,
            function UpdateToFollow(err, doc) {
              if (err) {
                return next(err)
              }
              res.status(200).json({ msg: "Following Brand", status: 200 })
            }
          )
          break
        default:
          for (let i = 0; i < cats.followers.length; i++) {
            savedCustomer = cats.followers[i]._id
          }

          if (checkUser >= 0) {
            BrandsDal.update(
              { _id: req.doc._id },
              unfollow,
              function UpdateToUnfollow(err, doc) {
                if (err) {
                  return next(err)
                }
                res.status(200).json({ msg: "Unfollowed Brand", status: 200 })
              }
            )
          } else {
            BrandsDal.update(
              { _id: req.doc._id },
              follow,
              function UpdateToUnfollow(err, doc) {
                if (err) {
                  return next(err)
                }
                res.status(200).json({ msg: "Following Brand", status: 200 })
              }
            )
          }
      }
    })
  }

  static likes(req, res, next) {
    const customer = req._user.customers
    const ilike = { $addToSet: { likes: customer } }
    const unlike = { $pull: { likes: customer } }

    BrandsDal.get({ _id: req.doc._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }

      const checkUser = cats.likes.indexOf(customer)

      switch (cats.likes.length) {
        case 0:
          BrandsDal.update({ _id: req.doc._id }, ilike, function UpdatetoLike(
            err,
            doc
          ) {
            if (err) {
              return next(err)
            }
            res.status(200).json({ msg: "Like Brand", status: 200 })
          })
          break
        default:
          if (checkUser >= 0) {
            BrandsDal.update(
              { _id: req.doc._id },
              unlike,
              function UpdateToUnLike(err, doc) {
                if (err) {
                  return next(err)
                }
                res.status(200).json({ msg: "Unliked Brand", status: 200 })
              }
            )
          } else {
            BrandsDal.update(
              { _id: req.doc._id },
              ilike,
              function UpdateToUnLike(err, doc) {
                if (err) {
                  return next(err)
                }
                res.status(200).json({ msg: "Like Brand", status: 200 })
              }
            )
          }
      }
    })
  }

  static message(req, res, next) {
    const query = {
      $and: [
        {
          brands: req.doc._id,
        },
        {
          salers: req._user.internal,
        },
      ],
    }
    const options = {}
    MessageDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.status(200).json(cats)
    })
  }

  static customerMessage(req, res, next) {
    const options = {}
    InternalDal.get({ brands: req.doc._id }, function getit(err, idata) {
      if (err) {
        return next(err)
      }
      const query = {
        $and: [
          {
            salers: idata._id,
          },
          {
            customer: req._user.customers,
          },
        ],
      }
      MessageDal.getCollection(query, options, function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        res.status(200).json(cats)
      })
    })
  }

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req
      .checkBody("title")
      .notEmpty()
      .withMessage(" title name should not be empty")

    if (!req.files[0]) {
      res.status(400)
      res.json({
        msg: "File is not passed",
      })
      return
    } else {
      const dest1 = `uploads/${req.files[0].filename}`
      body.img = dest1
    }

    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }

    body.customer = req._user.customer
    body.created_at = now
    body.created_by = req._user._id
    BrandsDal.create(body, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static searchBrands(req, res, next) {
    const body = req.body
    const searchQuery = {
      title: new RegExp(body.search, "i"),
    }
    const options = {}

    BrandsDal.getCollection(searchQuery, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static delete(req, res, next) {
    BrandsDal.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })

    InternalDal.delete({ brands: req.doc._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      UserDal.delete({ _id: cats.user._id }, function deleteit(err, iUser) {
        if (err) {
          return next(err)
        }
      })

      if (cats.videos) {
        removePicture(cats.videos, () => {})
      }
    })

    const options = {}

    ShowCaseDal.getCollection({ brand: req.doc._id }, options, function getAll(
      err,
      iShows
    ) {
      if (err) {
        return next(err)
      }
      for (let x = 0; x < iShows.length; x++) {
        ShowCaseDal.delete({ _id: iShows[x]._id }, function getAll(err, idata) {
          if (err) return next(err)
          if (idata[x].img) {
            removePicture(idata[x].img, () => {})
          }
        })
      }
    })
  }
}

export default BrandController
