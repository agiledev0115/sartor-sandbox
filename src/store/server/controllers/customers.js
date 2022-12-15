import fs from "fs"
import settings from "../../../../config/server"
import CustomerDal from "../dal/customers"
import CartDal from "../dal/carts"
import SalesDal from "../dal/sales"
import UserDal from "../dal/user"

function updateCustomer(customerId, dest, res, next) {
  CustomerDal.update({ _id: customerId }, { picture: dest }, (err, doc) => {
    if (err) {
      return next(err)
    }
    res.json(doc)
  })
}

function removePicture(picUrl, callback) {
  fs.unlink(settings.MEDIA.UPLOADES + picUrl, err => {
    callback()
  })
}

class CustomersController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateCustomer(req, res, next, id) {
    // Validate the id is mongoid or not
    req.checkParams("id", "Invalid param").isMongoId(id)

    const validationErrors = req.validationErrors()

    if (validationErrors) {
      res.status(404).json({
        error: true,
        message: "Wrong ID is Passed",
        status: 404,
      })
    } else {
      CustomerDal.get({ _id: id }, (err, doc) => {
        if (doc._id) {
          req.doc = doc
          next()
        } else {
          res.status(404).json({
            error: true,
            status: 404,
            msg: `Customer _id  ${id} not found`,
          })
        }
      })
    }
  }

  static updateCustomer(req, res, next) {
    const body = req.body
    CustomerDal.update({ _id: req.doc._id }, body, function updateCl(err, doc) {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }

  static deleteCustomer(req, res, next) {
    CustomerDal.delete({ _id: req.doc._id }, function delCl(err, doc) {
      if (err) {
        return next(err)
      }
      UserDal.delete({ _id: req.doc.user }, (err, doc) => {
        if (err) {
          return next(err)
        }
        // res.json(doc);
      })
      res.json(doc)
    })
  }

  static getCustomers(req, res, next) {
    const options = {}
    CustomerDal.getCollection({}, options, (err, docs) => {
      if (err) {
        return next(err)
      }
      res.json(docs)
    })
  }

  static getCustomer(req, res, next) {
    res.json(req.doc)
  }

  static showHelpers(req, res, next) {
    const FBid = req.user.uuid
    const query = { uuid: FBid }
    CustomerDal.getCollection(query, {}, (err, iDocs) => {
      if (err) {
        return next(err)
      }
      if (Object.keys(iDocs).length > 0) {
        switch (iDocs[0].preference) {
          case false:
            break
          case true:
            /** showing list of Preferences */
            const Hsize = iDocs.house_type
            const Mstatus = iDocs.marital_status
            const NChild = iDocs.number_children
            const Aequip = iDocs.available_equipment
            const address = iDocs.address
            const iReligion = iDocs.religion
            /** emplode out array */
            // var i; var E_equip;
            // for(i=0;i<A_equip.length;i++){
            //   E_equip = A_equip[i];
            // }
            const Mquery = {
              $and: [
                { house_size: Hsize },
                { family_size: Mstatus },
                { location: address },
                { children_size: NChild },
                { address },
              ],
            }
            break
          default:
            res.status(401).json({
              error: true,
              message: "ACCESS DENIED!",
              status: 401,
            })
        }
      } else {
        res.status(401).json({
          error: true,
          message: "We Don't Know You!",
          status: 401,
        })
      }
    })
  }

  static boughtitems(req, res, next) {
    const iUser = req._user._id
    const query = {}
    SalesDal.getCollection(query, {}, function searchUser(err, docs) {
      if (err) {
        return next(err)
      }
      switch (docs.length) {
        case 0:
          res.json(docs)
          break
        default:
          for (let x = 0; x < docs.length; x++) {
            if (docs[x].checkouts.created_by._id === iUser) {
              res.status(200).json(docs)
            } else {
              res.status(200).json(docs)
            }
          }
      }
    })
  }

  static searchUser(req, res, next) {
    const fname = req.query.f_name
    const lname = req.query.l_name
    const pcount = req.query.p_count
    const query = {
      $or: [
        { first_name: fname },
        { last_name: lname },
        { posts_count: pcount },
      ],
    }
    // var query = {first_name:fname, last_name:lname,posts_count:pcount};
    CustomerDal.getCollection(query, {}, function searchUser(err, docs) {
      if (err) {
        return next(err)
      }
      res.json(docs)
    })
  }

  static viewCart(req, res, next) {
    const query = { customers: req.doc._id }
    CartDal.get(query, function searchUser(err, docs) {
      if (err) {
        return next(err)
      }
      res.json(docs)
    })
  }

  static updateProfile(req, res, next) {
    const body = req.body
    CustomerDal.getCollection(
      { _id: req._user.customers },
      {},
      (err, iDocs) => {
        if (err) {
          return next(err)
        }
        switch (Object.keys(iDocs).length) {
          case 0:
            res.status(401).json({
              error: true,
              message: "Access Denied!",
              status: 401,
            })
            break
          default:
            CustomerDal.update(
              { _id: req._user.customers },
              body,
              (err, doc) => {
                if (err) {
                  return next(err)
                }
                // await firebase.auth().setCustomUserClaims(req.user.uuid, {completed:true});
                res.status(200).json(doc)
              }
            )
        }
      }
    )
  }

  static changeLanguage(req, res, next) {
    const body = req.body
    req
      .checkBody("language", "Language  should not be empty!")
      .withMessage("Should not be empty")
      .notEmpty()
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    CustomerDal.update(
      { _id: req._user._id },
      { language: body.language },
      function CustomerInfo(err, doc) {
        if (err) {
          return next(err)
        }
        res.json(doc)
      }
    )
  }

  static uploadProfile(req, res, next) {
    const dest = `uploads/${req.files[0].filename}`
    // var dest = 'uploads/' + (Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now() + req.files[0].filename;
    CustomerDal.update(
      { _id: req._user.customers },
      { picture: dest },
      (err, doc) => {
        //  CustomerDal.update({ _id: req._user }, { picture: dest }, (err, doc) => {
        if (err) {
          return next(err)
        }
        res.status(200)
        res.json({
          error: false,
          upload: "Success",
          status: 200,
        })
      }
    )
  }

  static removeProfilePicture(req, res, next) {
    CustomerDal.get({ _id: req._user.customers }, (err, doc) => {
      if (err) {
        return next(err)
      }
      if (doc.picture) {
        removePicture(doc.picture, () => {
          updateCustomer(req._user._id, null, res, next)
        })
      } else updateCustomer(req._user._id, null, res, next)
    })
  }

  static showProfile(req, res, next) {
    CustomerDal.get({ _id: req._user.customers }, function getByPaginationCb(
      err,
      doc
    ) {
      if (err) {
        return next(err)
      }
      res.status(200).json(doc)
    })
  }

  static getPaginated(req, res, next) {
    const page = req.query.page * 1 || 1
    const limit = req.query.per_page * 1 || 1
    const query = {}
    const queryOpts = {
      page,
      limit,
    }
    CustomerDal.getCollectionBy(query, queryOpts, function getByPaginationCb(
      err,
      doc
    ) {
      if (err) {
        return next(err)
      }
      if (!doc) {
        res.status(404),
          res.json({
            error: true,
            message: "Requested Data is not found",
            status: 404,
          })
      }
      res.json(doc)
    })
  }
}

export default CustomersController
