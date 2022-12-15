import moment from "moment"
import { isEmpty } from "lodash"
import {ObjectID} from "mongodb"
import settings from "../../../../config/server"
import UserDal from "../dal/user"
import ReviewDal from "../dal/reviews"
import ProductDal from "../dal/product"
import CategoryDal from "../dal/category"
import ImageDal from "../dal/images"
import BlogDal from "../dal/blog"
import CustomerDal from "../dal/customers"
import MessageDal from "../dal/messages"
import TokenDal from "../dal/token"
import BrandDal from "../dal/brands"
import ShowCaseDal from "../dal/showcase"
import InternalDal from "../dal/internal"
import CheckoutDal from "../dal/checkout"
import SalesDal from "../dal/sales"
import NotifiDal from "../dal/notification"

import fs from "fs"

const now = moment().toISOString()

function removePicture(picUrl, callback) {
  fs.unlink(settings.MEDIA.UPLOADS + picUrl, err => {
    if (err) {
      callback(err)
    }
  })
}

class WebAppNController {
  constructor() {}

  static viewProducts(req, res, next) {
    const productid = req.params.id
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      ReviewDal.getCollection({ product: productid }, options, function getAll(
        err,
        iReview
      ) {
        if (err) return next(err)
        ProductDal.get({ _id: productid }, function getAll(err, iProduct) {
          if (err) return next(err)
          CategoryDal.get({ _id: iProduct.category }, function getAll(
            err,
            iCategory
          ) {
            if (err) return next(err)
            const readStatus = { salers: cats.internal._id, is_read: false }
            MessageDal.getCollection(readStatus, options, function getAll(
              err,
              iChats
            ) {
              if (err) return next(err)
              SalesDal.getCollection(
                { products: iProduct._id },
                options,
                function getAll(err, iSales) {
                  if (err) return next(err)
                  const NotifyQUuery = {
                    $and: [
                      {
                        salers: cats.internal._id,
                      },
                      { is_read: false },
                    ],
                  }
                  NotifiDal.getCollection(
                    NotifyQUuery,
                    options,
                    function getAll(err, notification) {
                      if (err) {
                        return next(err)
                      }
                      res.render("detail", {
                        user: cats,
                        product: iProduct,
                        url: page,
                        review: iReview,
                        soldLists: iSales.length,
                        iCat: iCategory,
                        notify: notification,
                        count_unread: iChats.length,
                      })
                    }
                  )
                }
              )
            })
          })
        })
      })
    })
  }

  static readNotification(req, res, next) {
    const body = req.body
    NotifiDal.update({ _id: body.notifiId }, { is_read: true }, (err, doc) => {
      if (err) {
        next(err)
      }
      res.redirect(`/invoice/${body.invoiceId}`)
    })
    // const { productid, notifictionid } = req.body
    // const options = {}
    // const page = req.originalUrl
    // UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
    //   if (err) {
    //     return next(err)
    //   }
    //   ReviewDal.getCollection({ product: productid }, options, function getAll(
    //     err,
    //     iReview
    //   ) {
    //     if (err) return next(err)
    //     ProductDal.get({ _id: productid }, function getAll(err, iProduct) {
    //       if (err) return next(err)
    //       CategoryDal.get({ _id: iProduct.category }, function getAll(
    //         err,
    //         iCategory
    //       ) {
    //         if (err) return next(err)
    //         const readStatus = { salers: cats.internal._id, is_read: false }
    //         MessageDal.getCollection(readStatus, options, function getAll(
    //           err,
    //           iChats
    //         ) {
    //           if (err) return next(err)
    //           SalesDal.getCollection(
    //             { products: iProduct._id },
    //             options,
    //             function getAll(err, iSales) {
    //               if (err) return next(err)
    //               NotifiDal.update(
    //                 { _id: notifictionid },
    //                 { is_read: true },
    //                 function updatecommissionpayment(err, doc) {
    //                   if (err) {
    //                     return next(err)
    //                   }
    //                 }
    //               )
    //               res.render("detail", {
    //                 user: cats,
    //                 product: iProduct,
    //                 url: page,
    //                 review: iReview,
    //                 soldLists: iSales.length,
    //                 iCat: iCategory,
    //                 count_unread: iChats.length,
    //               })
    //             }
    //           )
    //         })
    //       })
    //     })
    //   })
    // })
  }

  static readMessages(req, res, next) {
    MessageDal.updateBulk({ salers: new ObjectID(req.user.internal) }, { is_read: true }, (err, doc) => {
      if (err) {
        next(err)
      }
      res.redirect(`/chat`)
    })
  }

  static updateProduct(req, res, next) {
    const { productid } = req.body
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      ReviewDal.getCollection({ product: productid }, options, function getAll(
        err,
        iReview
      ) {
        if (err) return next(err)
        ProductDal.get({ _id: productid }, function getAll(err, iProduct) {
          if (err) return next(err)
          CategoryDal.get({ _id: iProduct.category }, function getAll(
            err,
            iCategory
          ) {
            if (err) return next(err)
            const readStatus = { salers: cats.internal._id, is_read: false }
            MessageDal.getCollection(readStatus, options, function getAll(
              err,
              iChats
            ) {
              if (err) return next(err)
              BrandDal.getCollection({}, options, function getAll(
                err,
                iBrands
              ) {
                if (err) return next(err)
                CategoryDal.getCollection({}, options, function getAll(
                  err,
                  iCatalyst
                ) {
                  if (err) return next(err)
                  const NotifyQUuery = {
                    $and: [
                      {
                        salers: cats.internal._id,
                      },
                      { is_read: false },
                    ],
                  }
                  NotifiDal.getCollection(
                    NotifyQUuery,
                    options,
                    function getAll(err, notification) {
                      if (err) {
                        return next(err)
                      }
                      res.render("detailupdate", {
                        user: cats,
                        product: iProduct,
                        url: page,
                        review: iReview,
                        iCat: iCategory,
                        notify: notification,
                        count_unread: iChats.length,
                        Brand: iBrands,
                        category: iCatalyst,
                      })
                    }
                  )
                })
              })
            })
          })
        })
      })
    })
  }

  static updateTheProduct(req, res, next) {
    const body = req.body
    body.updated_at = now
    switch (req.files.length) {
      case 0:
        body.updated_at = now
        ProductDal.update({ _id: body.productid }, body, function updatepass(
          err,
          idocs
        ) {
          if (err) {
            return next(err)
          }
          req.flash("success_msg", "Product updated successfully")
          res.redirect("/product")
        })
        break
      case 1:
        ProductDal.get({ _id: body.productid }, (err, pDoc) => {
          if (err) {
            return next(err)
          }
          if (pDoc.img.video) {
            const vid = pDoc.img.video.split("/")[1]
            if (fs.existsSync(`${settings.MEDIA.UPLOADS}/${vid}`)) {
              fs.unlink(`${settings.MEDIA.UPLOADS}/${vid}`, err => {
                if (err) {
                  next(err)
                }
              })
            }
            const insertQuery = {
              video: `uploads/${req.files[0].filename}`,
            }
            ImageDal.update({ _id: pDoc.img }, insertQuery, (err, idoc) => {
              if (err) {
                return next(err)
              }
              body.img = idoc._id
              ProductDal.update(
                { _id: body.productid },
                body,
                function updatepass(err, idocs) {
                  if (err) {
                    return next(err)
                  }
                  req.flash("success_msg", "Product updated successfully")
                  res.redirect("/product")
                }
              )
            })
          }
        })
        break
      case 7:
        ProductDal.get({ _id: body.productid }, (err, pDoc) => {
          if (err) {
            return next(err)
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img0.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img0.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img1.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img1.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img2.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img2.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img3.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img3.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img4.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img4.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img5.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img5.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img6.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img6.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          const insertQuery = {
            img0: `uploads/${req.files[0].filename}`,
            img1: `uploads/${req.files[1].filename}`,
            img2: `uploads/${req.files[2].filename}`,
            img3: `uploads/${req.files[3].filename}`,
            img4: `uploads/${req.files[4].filename}`,
            img5: `uploads/${req.files[5].filename}`,
            img6: `uploads/${req.files[6].filename}`,
            created_at: now,
            created_by: req.user._id,
          }
          ImageDal.update({ _id: pDoc.img }, insertQuery, (err, idoc) => {
            if (err) {
              return next(err)
            }
            body.img = idoc._id
            ProductDal.update(
              { _id: body.productid },
              body,
              function updatepass(err, idocs) {
                if (err) {
                  return next(err)
                }
                req.flash("success_msg", "Product updated successfully")
                res.redirect("/product")
              }
            )
          })
        })
        break
      case 8:
        ProductDal.get({ _id: body.productid }, (err, pDoc) => {
          if (err) {
            return next(err)
          }
          const vid = pDoc.img.video.split("/")[1]
          if (fs.existsSync(`${settings.MEDIA.UPLOADS}/${vid}`)) {
            fs.unlink(`${settings.MEDIA.UPLOADS}/${vid}`, err => {
              if (err) {
                next(err)
              }
            })
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img0.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img0.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img1.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img1.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img2.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img2.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img3.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img3.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img4.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img4.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img5.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img5.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          if (
            fs.existsSync(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img6.split("/")[1]}`
            )
          ) {
            fs.unlink(
              `${settings.MEDIA.UPLOADS}/${pDoc.img.img6.split("/")[1]}`,
              err => {
                if (err) {
                  next(err)
                }
              }
            )
          }
          const insertQuery = {
            img0: `uploads/${req.files[0].filename}`,
            img1: `uploads/${req.files[1].filename}`,
            img2: `uploads/${req.files[2].filename}`,
            img3: `uploads/${req.files[3].filename}`,
            img4: `uploads/${req.files[4].filename}`,
            img5: `uploads/${req.files[5].filename}`,
            img6: `uploads/${req.files[6].filename}`,
            video: `uploads/${req.files[7].filename}`,
            created_at: now,
            created_by: req.user._id,
          }
          ImageDal.update({ _id: pDoc.img }, insertQuery, (err, idoc) => {
            if (err) {
              return next(err)
            }
            body.img = idoc._id
            ProductDal.update(
              { _id: body.productid },
              body,
              function updatepass(err, idocs) {
                if (err) {
                  return next(err)
                }
                req.flash("success_msg", "Product updated successfully")
                res.redirect("/product")
              }
            )
          })
        })
        break
      default:
        break
    }
  }

  static deleteProduct(req, res, next) {
    const body = req.body
    ProductDal.get({ _id: body.productid }, (err, pDoc) => {
      if (err) {
        return next(err)
      }
      const vid = pDoc.img.video.split("/")[1]
      if (fs.existsSync(`${settings.MEDIA.UPLOADS}/${vid}`)) {
        fs.unlink(`${settings.MEDIA.UPLOADS}/${vid}`, err => {
          if (err) {
            next(err)
          }
        })
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img0.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img0.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img1.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img1.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img2.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img2.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img3.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img3.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img4.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img4.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img5.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img5.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      if (
        fs.existsSync(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img6.split("/")[1]}`
        )
      ) {
        fs.unlink(
          `${settings.MEDIA.UPLOADS}/${pDoc.img.img6.split("/")[1]}`,
          err => {
            if (err) {
              next(err)
            }
          }
        )
      }
      ImageDal.delete({ _id: pDoc.img }, (err, idoc) => {
        if (err) {
          return next(err)
        }
        body.img = idoc._id
        ProductDal.delete({ _id: body.productid }, function updatepass(
          err,
          idocs
        ) {
          if (err) {
            return next(err)
          }
          req.flash("success_msg", "Product deleted successfully")
          res.redirect("/product")
        })
      })
    })
  }

  static removeReview(req, res, next) {
    const { removeid } = req.body
    const query = { _id: removeid }
    ReviewDal.delete(query, (err, doc) => {
      if (err) {
        return next(err)
      }
      if (doc.img) {
        removePicture(doc.img, () => {})
      }
      req.flash("success_msg", "Review Removed")
      res.redirect("/product")
    })
  }

  static updateTopBrand(req, res, next) {
    const { brandid, isTop } = req.body
    let booleantypes
    if (isTop === "true") {
      booleantypes = true
    }
    if (isTop === "false") {
      booleantypes = false
    }
    BrandDal.update(
      { _id: brandid },
      { is_top: booleantypes, updated_at: now },
      function updatepass(err, idocs) {
        if (err) {
          return next(err)
        }
        req.flash("success_msg", "Top Brand updated")
        res.redirect("/brands")
      }
    )
  }

  static blog(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      BlogDal.getCollection({}, options, function getAll(err, iBlog) {
        if (err) return next(err)
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) { return next(err) }
          
          const NotifyQUuery = {
            $and: [
              { salers: cats.internal._id },
              { is_read: false },
            ],
          }
          NotifiDal.getCollection(
            NotifyQUuery,
            options,
            function getAll(err, notification) {
              if (err) { return next(err) }
              res.render("blog", {
                user: cats,
                blog: iBlog,
                url: page,
                count_unread: iChats.length,
                notify: notification,
                chats: iChats,
                mom: moment
              })
            })          
        })
      })
    })
  }

  static notification(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CustomerDal.getCollection({}, options, function getAll(err, iCustomers) {
        if (err) return next(err)
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          NotifiDal.getCollection(
            { customers: { $exists: true } },
            options,
            function getAll(err, iNotifi) {
              if (err) {
                return next(err)
              }
              NotifiDal.getCollection(
                { salers: { $exists: true } },
                { salers: req.user.internal },
                function getAll(err, sNotifi) {
                  if (err) {
                    return next(err)
                  }
                  res.render("notification", {
                    clients: iCustomers,
                    user: cats,
                    url: page,
                    notifi: iNotifi,
                    sNotif: sNotifi,
                    count_unread: iChats.length,
                  })
                }
              )
            }
          )
        })
      })
    })
  }

  static customers(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CustomerDal.getCollection({}, options, function getAll(err, iCustomer) {
        if (err) return next(err)
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          res.render("customer", {
            user: cats,
            customers: iCustomer,
            url: page,
            count_unread: iChats.length,
          })
        })
      })
    })
  }

  static internalUsers(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      InternalDal.getCollection({}, options, function getAll(err, iCustomer) {
        if (err) return next(err)
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          res.render("internal", {
            user: cats,
            customers: iCustomer,
            url: page,
            count_unread: iChats.length,
          })
        })
      })
    })
  }

  static showCase(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      const readStatus = { salers: cats.internal._id, is_read: false }
      MessageDal.getCollection(readStatus, options, function getAll(
        err,
        iChats
      ) {
        if (err) {
          return next(err)
        }
        InternalDal.get({ _id: req.user.internal }, function getAll(err, ichk) {
          if (err) {
            return next(err)
          }
          switch (req.user.role) {
            case "salers":
              ShowCaseDal.getCollection(
                { brand: ichk.brands._id },
                options,
                function getAll(err, iImgs) {
                  if (err) {
                    return next(err)
                  }
                  res.render("showcase", {
                    images: iImgs,
                    user: cats,
                    url: page,
                    count_unread: iChats.length,
                  })
                }
              )
              break
            default:
          }
        })
      })
    })
  }

  static chat(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CustomerDal.getCollection(
        { created_by: cats._id },
        options,
        function getAll(err, iCustomer) {
          if (err) return next(err)
          const query = { salers: cats.internal._id }
          const readStatus = { salers: cats.internal._id, is_read: false }
          MessageDal.getCollection(query, options, function getAll(
            err,
            iChats
          ) {
            if (err) return next(err)
            TokenDal.get({ user: req.user._id }, function getAll(err, itkn) {
              if (err) return next(err)
              MessageDal.get(readStatus, function getAll(err, iRead) {
                if (err) return next(err)
                res.render("chat", {
                  user: cats,
                  customers: iCustomer,
                  url: page,
                  chat: iChats,
                  status: itkn,
                  read_stat: iRead,
                  count_unread: iChats.length,
                })
              })
            })
          })
        }
      )
    })
  }

  static createBlog(req, res, next) {
    const body = req.body
    if (!req.files[0]) {
      req.flash("error_msg", "File not uploaded")
      res.redirect("/blog")
    } else {
      const dest1 = `uploads/${req.files[0].filename}`
      body.image = dest1
    }
    BlogDal.create(body, (err, idoc) => {
      if (err) {
        return next(err)
      }
      req.flash("success_msg", "Blog Created")
      res.redirect("/blog")
    })
  }

  static createNotification(req, res, next) {
    const body = req.body
    const options = {}
    if (isEmpty(body.castbroad) && isEmpty(body.clients)) {
      req.flash(
        "error_msg",
        "You have to choose either broadcast or select client to send notification"
      )
      res.redirect("/notification")
    } else {
      if (isEmpty(body.castbroad)) {
        const addNotifi = {
          customers: body.clients,
          broadcast: false,
          created_at: now,
        }
        NotifiDal.create(addNotifi, (err, idoc) => {
          if (err) {
            return next(err)
          }
          req.flash("success_msg", "Notification Sent")
          res.redirect("/notification")
        })
      } else {
        CustomerDal.getCollection({}, options, function getAll(err, myClients) {
          if (err) {
            return next(err)
          }
          for (let y = 0; y < myClients.length; y++) {
            const addNotification = {
              customers: myClients[y],
              broadcast: true,
              created_at: now,
            }
            NotifiDal.create(addNotification, (err, idoc) => {
              if (err) {
                return next(err)
              }
            })
          }
          req.flash("success_msg", "Notification Sent")
          res.redirect("/notification")
        })
      }
    }
  }

  static removeNotification(req, res, next) {
    const { notificationid } = req.body
    const query = { _id: notificationid }
    NotifiDal.delete(query, (err, idoc) => {
      if (err) {
        return next(err)
      }
      if (idoc.image) {
        removePicture(idoc.image, () => {})
      }
      req.flash("error_msg", "notification Removed")
      switch (req.user.role) {
        case "super_admin":
          break
        case "admin":
          res.redirect("/notification")
          break
        case "salers":
          res.redirect("/dashboard")
          break
        default:
          break
      }
    })
  }

  static removeBlog(req, res, next) {
    const { blogid } = req.body
    const query = { _id: blogid }
    BlogDal.delete(query, (err, idoc) => {
      if (err) {
        return next(err)
      }
      if (idoc.image) {
        removePicture(idoc.image, () => {})
      }
      req.flash("error_msg", "blog Removed")
      res.redirect("/blog")
    })
  }

  static blogDetail(req, res, next) {
    const { blogid } = req.body
    const query = { _id: blogid }
    const page = req.originalUrl
    const options = {}
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      BlogDal.get(query, function getAll(err, iBlog) {
        if (err) {
          return next(err)
        }
        BlogDal.getCollection({}, {}, function getAll(err, alBlog) {
          if (err) {
            return next(err)
          }
          const readStatus = { salers: cats.internal._id, is_read: false }
          MessageDal.getCollection(readStatus, options, function getAll(
            err,
            iChats
          ) {
            if (err) return next(err)
            res.render("blogdetail", {
              user: cats,
              blog: iBlog,
              blogs: alBlog,
              url: page,
              count_unread: iChats,
            })
          })
        })
      })
    })
  }

  static removeCustomers(req, res, next) {
    const { customerid } = req.body
    const query = { _id: customerid }
    CustomerDal.delete(query, (err, idoc) => {
      if (err) {
        return next(err)
      }
      const uquery = { _id: idoc.user }
      UserDal.delete(uquery, (err, doc) => {
        if (err) {
          return next(err)
        }
        req.flash("success_msg", "Customers Removed")
        res.redirect("/customers")
      })
    })
  }

  static chatwithCustomer(req, res, next) {
    const body = req.body
    const options = {}
    body.created_by = req.user._id
    const query = {
      $and: [
        {
          salers: body.salers,
        },
        {
          customer: body.customer,
        },
      ],
    }
    MessageDal.getCollection(query, options, function getAll(err, checkChats) {
      if (err) {
        return next(err)
      }
      switch (checkChats.length) {
        case 0:
          req.flash(
            "error_msg",
            "You cannot send a message unless a customer starts a chat with you!"
          )
          res.redirect("/chat")
          break
        default:
          MessageDal.create(body, (err, save) => {
            if (err) {
              return next(err)
            }
            req.flash("success_msg", "message sent")
            res.redirect("/chat")
          })
          UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
            if (err) {
              return next(err)
            }
            const readStatus = {
              salers: cats.internal._id,
              is_read: false,
              customer: body.customer,
            }
            MessageDal.getCollection(readStatus, options, function getAll(
              err,
              iChats
            ) {
              if (err) return next(err)
              iChats.forEach(elements => {
                MessageDal.update(
                  { _id: elements._id },
                  { is_read: true, updated_at: now },
                  function updatepass(err, idocs) {
                    if (err) {
                      return next(err)
                    }
                  }
                )
              })
            })
          })
      }
    })
  }

  static showCustomer(req, res, next) {
    const { customerid } = req.body
    const query = { _id: customerid }
    const page = req.originalUrl
    const options = {}
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      const readStatus = { salers: cats.internal._id, is_read: false }
      MessageDal.getCollection(readStatus, options, function getAll(
        err,
        iChats
      ) {
        if (err) {
          return next(err)
        }
        CustomerDal.get(query, function getAll(err, iCustomer) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({}, options, function getAll(err, iBrands) {
            if (err) {
              return next(err)
            }

            SalesDal.getCollection({}, options, function getAll(err, sales) {
              if (err) {
                return next(err)
              }
              res.render("customerdetail", {
                user: cats,
                customer: iCustomer,
                url: page,
                count_unread: iChats.length,
                brands: iBrands,
                bought: sales,
              })
            })
          })
        })
      })
    })
  }

  static searchSartar(req, res, next) {
    const body = req.body
    const searchCategory = body.category
    const searchProduct = body.product
    const searchBrand = body.brands
    const searchblog = body.blog
    const searchcustomer = body.customers
    const page = req.originalUrl
    const options = {}
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      const readstatus = { salers: cats.internal._id, is_read: false }
      MessageDal.getCollection(readstatus, options, function getAll(
        err,
        iChats
      ) {
        if (err) {
          return next(err)
        }
        if (!isEmpty(searchcustomer)) {
          const query = {
            $or: [
              { full_name: new RegExp(searchcustomer, "i") },
              { email: new RegExp(searchcustomer, "i") },
            ],
          }
          CustomerDal.getCollection(query, options, function getAll(
            err,
            iCustomer
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              customer: iCustomer,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(searchblog)) {
          const query = {
            $or: [
              { title: new RegExp(searchblog, "i") },
              { story: new RegExp(searchblog, "i") },
            ],
          }
          BlogDal.getCollection(query, options, function getAll(err, iBlog) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              blog: iBlog,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(body.blogdetail)) {
          const query = {
            $or: [
              { title: new RegExp(body.blogdetail, "i") },
              { story: new RegExp(body.blogdetail, "i") },
            ],
          }
          BlogDal.getCollection(query, options, function getAll(err, iBlog) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              blog: iBlog,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(searchBrand)) {
          const query = { title: new RegExp(searchBrand, "i") }
          BrandDal.getCollection(query, options, function getAll(err, iBrand) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              brand: iBrand,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(searchProduct)) {
          const query = {
            $or: [
              { name: new RegExp(searchProduct, "i") },
              { store: new RegExp(searchProduct, "i") },
              { description: new RegExp(searchProduct, "i") },
            ],
          }
          ProductDal.getCollection(query, options, function getAll(
            err,
            iProducts
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              product: iProducts,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(body.products)) {
          const query = {
            $or: [
              { name: new RegExp(body.products, "i") },
              { store: new RegExp(body.products, "i") },
              { description: new RegExp(body.products, "i") },
            ],
          }
          ProductDal.getCollection(query, options, function getAll(
            err,
            iProducts
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              product: iProducts,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(body.search)) {
          const query = {
            $or: [
              { name: new RegExp(body.search, "i") },
              { store: new RegExp(body.search, "i") },
              { description: new RegExp(body.search, "i") },
            ],
          }
          ProductDal.getCollection(query, options, function getAll(
            err,
            iProducts
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              product: iProducts,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(body.dashboard)) {
          const query = {
            $or: [
              { name: new RegExp(body.dashboard, "i") },
              { store: new RegExp(body.dashboard, "i") },
              { description: new RegExp(body.dashboard, "i") },
            ],
          }
          ProductDal.getCollection(query, options, function getAll(
            err,
            iProducts
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              product: iProducts,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(body.detail)) {
          const query = {
            $or: [
              { name: new RegExp(body.detail, "i") },
              { store: new RegExp(body.detail, "i") },
              { description: new RegExp(body.detail, "i") },
            ],
          }
          ProductDal.getCollection(query, options, function getAll(
            err,
            iProducts
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              product: iProducts,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(searchCategory)) {
          const query = { name: new RegExp(searchCategory, "i") }
          CategoryDal.getCollection(query, options, function getAll(
            err,
            iCategory
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              categories: iCategory,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else if (!isEmpty(body.internal)) {
          const query = {
            $or: [
              { first_name: new RegExp(body.internal, "i") },
              { last_name: new RegExp(body.internal, "i") },
            ],
          }
          InternalDal.getCollection(query, options, function getAll(
            err,
            internals
          ) {
            if (err) {
              return next(err)
            }
            res.render("search", {
              user: cats,
              internal: internals,
              url: page,
              count_unread: iChats.length,
            })
          })
        } else {
          res.render("search", {
            user: cats,
            url: page,
            count_unread: iChats.length,
          })
        }
      })
    })
  }

  static getCheckouts(req, res, next) {
    const { checkid } = req.body
    const query = { _id: checkid }
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      const readStatus = { salers: cats.internal._id, is_read: false }
      MessageDal.getCollection(readStatus, options, function getAll(
        err,
        iChats
      ) {
        if (err) {
          return next(err)
        }
        CheckoutDal.get(query, function getAll(err, iCheck) {
          if (err) {
            return next(err)
          }
          SalesDal.getCollection(
            { checkouts: iCheck._id },
            options,
            function getAll(err, iSales) {
              if (err) {
                return next(err)
              }
              res.render("checkouts", {
                checkdata: iCheck,
                sales: iSales,
                user: cats,
                url: page,
                count_unread: iChats.length,
              })
            }
          )
        })
      })
    })
  }

  static blogEdit(req, res, next) {
    const blogid = req.params.id
    const query = { _id: blogid }
    const page = req.originalUrl
    const options = {}
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      BlogDal.get(query, function getAll(err, iBlog) {
        if (err) {
          return next(err)
        }
        BlogDal.getCollection({}, {}, function getAll(err, alBlog) {
          if (err) {
            return next(err)
          }
          const readStatus = { salers: cats.internal._id, is_read: false }
          MessageDal.getCollection(readStatus, options, function getAll(
            err,
            iChats
          ) {
            if (err) return next(err)
            res.render("blogedit", {
              user: cats,
              blog: iBlog,
              blogs: alBlog,
              url: page,
              count_unread: iChats,
              moment: moment,
              chats: iChats
            })
          })
        })
      })
    })
  }

  static updateBlog(req, res, next) {
    const body = req.body
    if (req.files[0]) {
      const query = { _id: body.id }
      BlogDal.get(query, (err, iBlog) => {
        if (err) {
          return next(err)
        }
        if (iBlog.image) {
          const img = iBlog.image.split("/")[1]
          removePicture(`/${img}`, () => {})
        }
      })
      const dest1 = `uploads/${req.files[0].filename}`
      body.image = dest1
    }
    BlogDal.update(body.id, body, (err, idoc) => {
      if (err) {
        return next(err)
      }
      req.flash("success_msg", "Blog Updated")
      res.redirect("/blog/")
    })
  }

  static sendLike(req, res, next) {
    const body = req.body
    ProductDal.get({ _id: body.productid }, (err, product) => {
      if (err) {
        next(err)
      }
      const obj = {
        rating: +((product.rating || 0) + 1),
      }
      ProductDal.update({ _id: product._id }, obj, (err, doc) => {
        if (err) {
          next(err)
        }
        res.redirect(req.get("referer"))
      })
    })
  }

  static removeLike(req, res, next) {
    const body = req.body
    ProductDal.get({ _id: body.productid }, (err, product) => {
      if (err) {
        next(err)
      }
      const obj = {
        rating: +(product.rating - 1),
      }
      ProductDal.update({ _id: product._id }, obj, (err, doc) => {
        if (err) {
          next(err)
        }
        req.flash("success_msg", "Like removed")
        res.redirect(req.get("referer"))
      })
    })
  }
}

export default WebAppNController
