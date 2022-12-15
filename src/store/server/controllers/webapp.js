import moment, { defaultFormat } from "moment"
import bcrypt from "bcrypt"
import passport from "passport"
import settings from "../../../../config/server"
import UserDal from "../dal/user"
import CustoDal from "../dal/customers"
import CheckDal from "../dal/checkout"
import InternalDal from "../dal/internal"
import CategoryDal from "../dal/category"
import BrandDal from "../dal/brands"
import BankDetailDal from "../dal/bankdetails"
import ProductDal from "../dal/product"
import ImageDal from "../dal/images"
import MessageDal from "../dal/messages"
import SalesDal from "../dal/sales"
import NotifDal from "../dal/notification"
import FavorDal from "../dal/favorite"
import RevieDal from "../dal/reviews"
import WishsDal from "../dal/wishlists"
import CartsDal from "../dal/carts"
import ShowCaseDal from "../dal/showcase"
import OrderDal from "../dal/order"
import OrderBackupDal from "../dal/orderbackup"
import Order from "../models/order"
import Internal from "../models/internal"
import Brands from "../models/brands"
import ShowCaseCommentDal from "../dal/showcasecomment"
import ShowCaseLikeDal from "../dal/showcaselike"
import TimeLineDal from "../dal/timeline"
import TokenDal from "../dal/token"
import ActivitiesDal from "../dal/activities"
import fs from "fs"

function removePicture(picUrl, callback) {
  fs.unlink(`${settings.MEDIA.UPLOADS}${picUrl}`, err => {
    if (err) {
      callback(err)
    }
    callback()
  })
}

function thousandsSeparators(num) {
  const numParts = num.toString().split(".")
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return numParts.join(".")
}

function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + " years"
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + " months"
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + " days"
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + " hours"
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + " minutes"
  }
  return "Just now"
  // return Math.floor(seconds) + " seconds"
}

class WebAppController {
  constructor() {}

  static authentication(req, res, next) {
    const now = moment().toISOString()
    passport.authenticate('local', function(err, user) {
    if (err) {          
      res.redirect('/');
      return
    }
    if (!user) {
        req.flash("error_msg", "Wrong Email or Password")
       res.redirect('/');
       return
    }
    req.logIn(user, function(err) {
        if (err) {
          res.redirect('/');
          return
        }
        ActivitiesDal.create({
          activity_type: "User Login",
          activity_detail: "",
          created_at: now,
          created_by: user._id,
        },
        (err, idoc) => {
          if (err) {
            return next(err)
          }
        })
        //when all set, send the response
        res.redirect('/dashboard');
        return
      })
    })(req, res, next);
  } 

  static registeration(req, res, next) {
    const now = moment().toISOString()
    const body = req.body
    const query = { username: body.username }
    const options = {}
    // const errors = []
    body.created_at = now
    BrandDal.getCollection({ title: body.brandName }, options, function getAll(
      err,
      checkCategory
    ) {
      if (err) {
        return next(err)
      }
      switch (Object.keys(checkCategory).length) {
        case 1:
          req.flash("error_msg", "Brand name already exists")
          res.redirect("/brands")
          break
        case 0:
          if (!req.files[0]) {
            req.flash("error_msg", "Error Occured Image not uploaded")
            res.redirect("/brands")
          } else {
            const dest1 = `uploads/${req.files[0].filename}`
            body.img = dest1
            body.title = body.brandName
            BrandDal.create(body, (err, brDoc) => {
              if (err) {
                return next(err)
              }
              UserDal.getCollection(query, options, function getAll(err, cats) {
                if (err) {
                  return next(err)
                }
                switch (Object.keys(cats).length) {
                  case 0:
                    const secrets = body.password
                    if (secrets.length < 6) {
                      req.flash(
                        "error_msg",
                        "password must be at least more than 5 characters"
                      )
                      res.redirect("/signup")
                    } else {
                      if (body.password === body.c_password) {
                        InternalDal.getCollection(
                          { brands: brDoc._id },
                          options,
                          function getAll(err, iBrandCheck) {
                            if (err) {
                              return next(err)
                            }
                            switch (iBrandCheck.length) {
                              case 0:
                                UserDal.create(body, (err, idoc) => {
                                  if (err) {
                                    return next(err)
                                  }
                                  body.user = idoc
                                  body.brands = brDoc._id
                                  InternalDal.create(body, (err, inDoc) => {
                                    if (err) {
                                      return next(err)
                                    }
                                    UserDal.update(
                                      { _id: idoc._id },
                                      {
                                        internal: inDoc._id,
                                        realm: "internal",
                                      },
                                      function updateUser(err, udoc) {
                                        if (err) {
                                          return next(err)
                                        }
                                      }
                                    )
                                  })
                                  req.flash(
                                    "success_msg",
                                    "You have successfully registered"
                                  )
                                  res.redirect("/")
                                })
                                break
                              case 1:
                                req.flash(
                                  "error_msg",
                                  "Brand already taken by another seller"
                                )
                                res.redirect("/signup")
                                break
                              default:
                                req.flash(
                                  "error_msg",
                                  "Brand already taken by another seller"
                                )
                                res.redirect("/signup")
                            }
                          }
                        )
                      } else {
                        req.flash("error_msg", "Password does not match")
                        res.redirect("/signup")
                      }
                    }
                    break
                  default:
                    req.flash("error_msg", "Email Already Exists")
                    res.redirect("/signup")
                }
              })
            })
          }
          break
        default:
      }
    })
  }

  static showcase(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) { return next(err) }
      const readStatus = { salers: cats.internal._id, is_read: false }
      MessageDal.getCollection(readStatus, options, function getAll(
        err,
        iChats
      ) {
        if (err) { return next(err) }
        InternalDal.getCollection({_id : { $ne: req.user.internal }}, options, function getAll(err, ochk) {
          ActivitiesDal.getCollection({ created_by: req.user._id }, options, function getAll(err, activities) {
            if (err) { return next(err) }
            InternalDal.get({ _id: req.user.internal }, function getAll(err, ichk) {
              if (err) { return next(err) }
              InternalDal.getCollection({brands : { $in: ichk.brands.followers }}, options, function get(err, followers){
                BrandDal.getCollection({followers : { $in: cats.internal.brands._id }}, options, function get(error, followed){
                  BrandDal.get({_id: cats.internal.brands._id}, function get(err, iBrand){
                    if (err) { return next(err) }
                      switch (req.user.role) {
                        case "salers":
                          ShowCaseDal.getMedia(ichk.brands._id, 12,
                            function getAll(err, iImgs) {
                              if (err) { return next(err) }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }

                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) { return next(err) }
                                  res.render("showcase", {
                                    images: iImgs,
                                    user: cats,
                                    url: page,
                                    notify: notification,
                                    count_unread: iChats.length,
                                    chats: iChats,
                                    moment: moment,
                                    brand: iBrand,
                                    activities: activities,
                                    otherbrands: ochk,
                                    followers: followers,
                                    followed: followed,
                                  })
                              })
                            }
                          )
                          break
                        default:
                      }
                  });
                })
              })
            })
          })
        })
      })
    })
  }

  static uploadShowCase(req, res, next) {
    const now = moment().toISOString()
    const body = req.body
    BrandDal.get({ _id: body.internal }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      switch (Object.keys(cats).length) {
        case 0:
          req.flash("error_msg", "Brand does not exist")
          res.redirect("/showcase")
          break
        default:
          if (!req.files[0]) {
            req.flash("error_msg", "There is no file")
            res.redirect("/showcase")
          } else {
            for (let x = 0; x < req.files.length; x++) {
              ShowCaseDal.create(
                {
                  img: `uploads/${req.files[x].filename}`,
                  brand: cats._id,
                  created_by: req.user._id,
                  created_at: now,
                },
                (err, idoc) => {
                  if (err) {
                    return next(err)
                  }
                }
              )
            }
            req.flash("success_msg", "ShowCase Uploaded")
            res.redirect("/showcase")
          }
      }
    })
  }

  static removeVideos(req, res, next) {
    InternalDal.get({ _id: req.user.internal }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      if (cats.videos) {
        removePicture(cats.videos, () => {})
      }
      const options = { $unset: { videos: "" } }
      InternalDal.update({ _id: req.user.internal }, options, function getAll(
        err,
        iUpdate
      ) {
        if (err) {
          return next(err)
        }
        req.flash("success_msg", "Video Removed")
        res.redirect("/profile")
      })
    })
  }

  static removeShowCaseImages(req, res, next) {
    const removeid = req.body
    const query = { _id: removeid }
    ShowCaseDal.delete(query, (err, doc) => {
      if (err) {
        return next(err)
      }
      if (doc.img) {
        removePicture(doc.img, () => {})
      }
      req.flash("success_msg", "Image Removed")
      res.redirect("/showcase")
    })
  }

  static logout(req, res, next) {
    req.logout()
    req.flash("success_msg", "You are logged out")
    res.redirect("/")
  }

  static signup(req, res, next) {
    const options = {}
    BrandDal.getCollection({}, options, function getAll(err, aBrand) {
      if (err) {
        return next(err)
      }
      res.render("signup", {
        url: req.originalUrl,
        brand: aBrand,
      })
    })
  }

  static ForgotPassword(req, res, next) {
    // const options = {}
    // BrandDal.getCollection({}, options, function getAll(err, aBrand) {
    //   if (err) {
    //     return next(err)
    //   }
    //   res.render("forgot_password", {
    //     url: req.originalUrl,
    //     brand: aBrand,
    //   })
    // })
    res.render("forgot_password", {
      url: req.originalUrl,
    })
  }

  static DashBoard(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) { return next(err) }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }

                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  OrderDal.getCollection(
                                    { created_by: cats._id },
                                    {},
                                    function getAll(err, orders) {
                                      if (err) {
                                        return next(err)
                                      }
                                      OrderDal.getTopSellingProducts(req.user._id, function getAll(err, topProducts) {
                                        if (err) { return next(err) }
                                        
                                        OrderDal.getSalesTotal(req.user._id, 'month', function getAll(err, monthlyTotal) {
                                          if (err) { return next(err) }

                                          OrderDal.getSalesTotal(req.user._id, 'year', function getAll(err, yearlyTotal) {
                                            if (err) { return next(err) }
                                            
                                              OrderDal.getInvoiceCount(req.user._id, function getOne(err, invoiceCount){
                                                if (err) { return next(err) }
                                                res.render("dashboard", {
                                                user: cats,
                                                order: iCheckedOuts,
                                                url: page,
                                                count_unread: iChats.length,
                                                chats: iChats,
                                                annual: iAnnual,
                                                orders,
                                                Brands: iBrands,
                                                ABrands: aBrand,
                                                products: iProduct,
                                                solditems: iSales,
                                                soldit: iSoldit,
                                                notify: notification,
                                                annaulreport: salersAnnual,
                                                count_products_sold: iSales.length,
                                                count_top_brands: iBrands.length,
                                                totalSum: thousandsSeparators(sum),
                                                topProducts: topProducts,
                                                monthlySales: thousandsSeparators(monthlyTotal),
                                                yearlySales: thousandsSeparators(yearlyTotal),
                                                moment: moment,
                                                invoiceCount: invoiceCount
                                              })
                                            })
                                          })
                                        })
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static PersonalProfile(req, res, next) {
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
                  if (err) { return next(err) }
                  const NotifyQUuery = {
                    $and: [
                      { salers: cats.internal._id },
                      { is_read: false },
                    ],
                  }


                  NotifDal.getCollection(
                    NotifyQUuery,
                    options,
                    function getAll(err, notification) {
                      if (err) { return next(err) }
                      res.render("profile", {
                        images: iImgs,
                        user: cats,
                        url: page,
                        count_unread: iChats.length,
                        notify: notification,
                        chats: iChats,
                        moment: moment
                      })
                    })
              })
              break
            default:
              res.render("profile", {
                user: cats,
                url: page,
                count_unread: iChats.length,
              })
          }
        })
      })
    })
  }

  static category(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CategoryDal.getCollection({}, options, function getAll(
        err,
        checkCategory
      ) {
        if (err) return next(err)

        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          const NotifyQUuery = {
            $and: [
              { salers: cats.internal._id },
              { is_read: false },
            ],
          }
          NotifDal.getCollection(
            NotifyQUuery,
            options,
            function getAll(err, notification) {
              if (err) {
                return next(err)
              }
              res.render("category", {
                user: cats,
                catInfo: checkCategory,
                url: page,
                notify: notification,
                count_unread: iChats.length,
                chats: iChats,
                moment: moment
              })
            }
          )
        })
      })
    })
  }

  static allProducts(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      BrandDal.getCollection({}, options, function getAll(err, iBrand) {
        if (err) {
          return next(err)
        }
        CategoryDal.getCollection({}, options, function getAll(err, iCategory) {
          if (err) return next(err)
          ProductDal.getCollection({}, options, function getAll(err, iProduct) {
            if (err) return next(err)
            const readStatus = { salers: cats.internal._id, is_read: false }
            MessageDal.getCollection(readStatus, options, function getAll(
              err,
              iChats
            ) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection(
                { created_by: req.user._id },
                options,
                function getAll(err, urProduct) {
                  if (err) return next(err)
                  const NotifyQUuery = {
                    $and: [
                      {
                        salers: cats.internal._id,
                      },
                      { is_read: false },
                    ],
                  }
                  NotifDal.getCollection(NotifyQUuery, options, function getAll(
                    err,
                    notification
                  ) {
                    if (err) {
                      next(err)
                    }
                    CustoDal.getCollection(
                      { created_by: cats._id },
                      {},
                      function getAll(err, customers) {
                        if (err) {
                          return next(err)
                        }
                        res.render("product", {
                          user: cats,
                          product: iProduct,
                          YourProducts: urProduct,
                          url: page,
                          brand: iBrand,
                          notify: notification,
                          catInfo: iCategory,
                          count_unread: iChats.length,
                          chats: iChats,
                          moment: moment
                        })
                      }
                    )
                  })
                }
              )
            })
          })
        })
      })
    })
  }

  static products(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      BrandDal.getCollection({}, options, function getAll(err, iBrand) {
        if (err) {
          return next(err)
        }
        CategoryDal.getCollection({}, options, function getAll(err, iCategory) {
          if (err) return next(err)
          ProductDal.getCollection({}, options, function getAll(err, iProduct) {
            if (err) return next(err)
            const readStatus = { salers: cats.internal._id, is_read: false }
            MessageDal.getCollection(readStatus, options, function getAll(
              err,
              iChats
            ) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection(
                { created_by: req.user._id },
                options,
                function getAll(err, urProduct) {
                  if (err) return next(err)
                  const NotifyQUuery = {
                    $and: [
                      {
                        salers: cats.internal._id,
                      },
                      { is_read: false },
                    ],
                  }
                  NotifDal.getCollection(NotifyQUuery, options, function getAll(
                    err,
                    notification
                  ) {
                    if (err) {
                      return next(err)
                    }
                    CustoDal.getCollection(
                      { created_by: cats._id },
                      {},
                      function getAll(err, customers) {
                        if (err) {
                          return next(err)
                        }
                        res.render("products", {
                          user: cats,
                          product: iProduct,
                          url: page,
                          YourProducts: urProduct,
                          brand: iBrand,
                          notify: notification,
                          catInfo: iCategory,
                          count_unread: iChats.length,
                          chats: iChats,
                          moment: moment
                        })
                      }
                    )
                  })
                }
              )
            })
          })
        })
      })
    })
  }

  static brands(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      BrandDal.getCollection({}, options, function getAll(err, iBrand) {
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

          NotifDal.getCollection(
            NotifyQUuery,
            options,
            function getAll(err, notification) {
              if (err) { return next(err) }
              res.render("brands", {
                user: cats,
                brands: iBrand,
                url: page,
                count_unread: iChats.length,
                notify: notification,
                chats: iChats,
                moment: moment
              })
          })
        })
      })
    })
  }

  static createCategory(req, res, next) {
    const body = req.body
    const options = {}
    CategoryDal.getCollection(
      { name: body.categoryname },
      options,
      function getAll(err, checkCategory) {
        if (err) {
          return next(err)
        }
        switch (Object.keys(checkCategory).length) {
          case 1:
            req.flash("error_msg", "Category name already exists")
            res.redirect("/category")
            break
          case 0:
            const now = moment().toISOString()
            body.created_at = now
            body.name = body.categoryname
            CategoryDal.create(body, (err, inDoc) => {
              if (err) {
                return next(err)
              }
              req.flash("success_msg", "Category Created")
              res.redirect("/category")
            })
            break
          default:
            break
        }
      }
    )
  }

  static createBrand(req, res, next) {
    const body = req.body
    const options = {}
    BrandDal.getCollection({ title: body.brandName }, options, function getAll(
      err,
      checkCategory
    ) {
      if (err) {
        return next(err)
      }
      switch (Object.keys(checkCategory).length) {
        case 1:
          req.flash("error_msg", "Brand name already exists")
          res.redirect("/brands")
          break
        case 0:
          const now = moment().toISOString()
          body.created_at = now
          body.title = body.brandName
          if (!req.files[0]) {
            req.flash("error_msg", "Error Occured Image not uploaded")
            res.redirect("/brands")
          } else {
            const dest1 = `uploads/${req.files[0].filename}`
            body.img = dest1
            BrandDal.create(body, (err, inDoc) => {
              if (err) {
                return next(err)
              }
              req.flash("success_msg", "Brand Created")
              res.redirect("/brands")
            })
          }
          break
        default:
          break
      }
    })
  }

  static removeBrands(req, res, next) {
    const brandid = req.body
    const query = { _id: brandid }
    // When you remove the brand
    BrandDal.delete(query, (err, doc) => {
      if (err) {
        return next(err)
      }
      if (doc.img) {
        removePicture(doc.img, () => {})
      }
      // You shall remove the seller
      InternalDal.delete({ brands: brandid }, (err, csdoc) => {
        if (err) {
          return next(err)
        }
        if (csdoc.picture) {
          switch (csdoc.picture) {
            case "uploads/default_profile.png":
              console.log("do not remove the default_profile")
              break
            default:
              removePicture(csdoc.picture, () => {})
          }
          // You shall remove the seller's account information
          UserDal.delete({ _id: csdoc.user._id }, (err, uDoc) => {
            if (err) {
              return next(err)
            }
          })
          // You shall remove the seller's uploaded product
          ProductDal.delete({ brands: brandid }, (err, pDoc) => {
            if (err) {
              return next(err)
            }
            // You shall remove the product images and videos
            ImageDal.delete({ _id: pDoc.img }, (err, imdoc) => {
              if (err) {
                return next(err)
              }
              if (imdoc.img0) {
                removePicture(imdoc.img0, () => {})
              }
              if (imdoc.img1) {
                removePicture(imdoc.img1, () => {})
              }
              if (imdoc.img2) {
                removePicture(imdoc.img2, () => {})
              }
              if (imdoc.img3) {
                removePicture(imdoc.img3, () => {})
              }
              if (imdoc.img4) {
                removePicture(imdoc.img4, () => {})
              }
              if (imdoc.img5) {
                removePicture(imdoc.img5, () => {})
              }
              if (imdoc.img6) {
                removePicture(imdoc.img6, () => {})
              }
              if (imdoc.img7) {
                removePicture(imdoc.img7, () => {})
              }
            })

            /**
             * THOUGH SHALL REMOVE EVERYTHING THAT IS RELATED TO PRODUCT
             * ---------------------------------------------------------
             * @includes
             * Favorite
             * Reviews
             * Checkouts
             * Sales
             * wishlists
             * carts
             * Notification
             */
            FavorDal.delete({ product: pDoc._id }, (err, fdoc) => {
              if (err) {
                return next(err)
              }
              const quency = { $pull: { favorite: fdoc._id } }
              /** time pull the product from customer */
              CustoDal.update(quency, {}, function UpdateCustomer(err, cDoc) {
                if (err) {
                  return next(err)
                }
              })
            })
            RevieDal.delete({ product: pDoc._id }, (err, rdoc) => {
              if (err) {
                return next(err)
              }
              const quency = { $pull: { reviews: rdoc._id } }
              /** time pull the product from customer */
              CustoDal.update(quency, {}, function UpdateCustomer(err, cuSDoc) {
                if (err) {
                  return next(err)
                }
              })
              if (rdoc.img) {
                removePicture(rdoc.img, () => {})
              }
            })
            CartsDal.delete({ product: pDoc._id }, (err, caDoc) => {
              if (err) {
                return next(err)
              }
            })
            WishsDal.delete({ product: pDoc._id }, (err, wDoc) => {
              if (err) {
                return next(err)
              }
            })
            NotifDal.delete({ product: pDoc._id }, (err, nDoc) => {
              if (err) {
                return next(err)
              }
            })
            SalesDal.delete({ products: pDoc._id }, (err, sDoc) => {
              if (err) {
                return next(err)
              }
              CheckDal.delete({ _id: sDoc.checkouts._id }, (err, chDoc) => {
                if (err) {
                  return next(err)
                }
              })
            })
          })
        }
      })
      req.flash("success_msg", "Brand Removed")
      res.redirect("/brands")
    })
  }

  static removeCategory(req, res, next) {
    const catid = req.body.catid
    CategoryDal.delete({ _id: catid }, (err, doc) => {
      if (err) {
        return next(err)
      }
      req.flash("success_msg", "Category Removed")
      res.redirect("/category")
    })
  }

  static uploadedVideo(req, res, next) {
    const { userid, description } = req.body
    const query = { _id: userid }
    const options = {}
    const now = moment().toISOString()
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    UserDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      switch (Object.keys(cats).length) {
        case 0:
          req.flash("error_msg", "Unauthorized User")
          res.redirect("/showcase")
          break
        case 1:
          if (!req.files) {
            req.flash("error_msg", "File must be selected")
            res.redirect("/showcase")
          } else {
            switch (req.files[0].mimetype) {
              case "video/mp4":
                UserDal.get({ _id: userid }, function updatepass(err, user) {
                  if (err) {
                    return next(err)
                  }
                  InternalDal.update(
                    { _id: user.internal._id },
                    {
                      descriptions: description,
                      updated_at: now,
                      videos: `uploads/${req.files[0].filename}`,
                    },
                    function updatepass(err, idocs) {
                      if (err) {
                        return next(err)
                      }
                    }
                  )
                  req.flash("success_msg", "Profile Changed successfully")
                  res.redirect("/showcase")
                })
                break
              default:
                req.flash(
                  "error_msg",
                  "Your Item selection is not a video format"
                )
                res.redirect("/showcase")
            }
          }
          break
        default:
      }
    })
  }

  static changeProfile(req, res, next) {
    const { firstName, lastName, username, userid } = req.body
    const query = { _id: userid }
    const options = {}
    const now = moment().toISOString()
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    UserDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      switch (Object.keys(cats).length) {
        case 0:
          req.flash("error_msg", "Unauthorized User")
          res.redirect("/profile")
          break
        case 1:
          UserDal.update(
            { _id: userid },
            { username, updated_at: now, logged_in_before: true },
            function updatepass(err, user) {
              if (err) {
                return next(err)
              }
              InternalDal.update(
                { _id: user.internal._id },
                {
                  first_name: firstName,
                  last_name: lastName,
                  email: username,
                  updated_at: now,
                },
                function updatepass(err, idocs) {
                  if (err) {
                    return next(err)
                  }
                }
              )
              req.flash("success_msg", "Profile Updated")
              res.redirect("/profile")
            }
          )
          break
        default:
      }
    })
  }

  static changePassword(req, res, next) {
    const { old, newPass, confrm, userid } = req.body
    const query = { _id: userid }
    const options = {}

    UserDal.getCollection(query, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      switch (Object.keys(cats).length) {
        case 0:
          req.flash("error_msg", "Unauthorized User")
          res.redirect("/profile")
          break
        case 1:
          if (old.length <= 5 || newPass.lenth <= 5) {
            req.flash("error_msg", "Password length must be at least 6")
            res.redirect("/profile")
          } else {
            bcrypt.compare(old, cats[0].password, function done(err, isOk) {
              if (err) {
                return next(err)
              }
              if (!isOk) {
                req.flash("error_msg", "Please enter the correct password")
                res.redirect("/profile")
              } else {
                if (newPass !== confrm) {
                  req.flash("error_msg", "Password does not match")
                  res.redirect("/profile")
                } else {
                  bcrypt.genSalt(settings.SALT_LENGTH, function genSalt(
                    err,
                    salt
                  ) {
                    if (err) {
                      return next(err)
                    }
                    bcrypt.hash(newPass, salt, function hashPasswd(err, hash) {
                      if (err) {
                        return next(err)
                      }
                      const now = moment().toISOString()
                      UserDal.update(
                        { _id: userid },
                        {
                          password: hash,
                          updated_at: now,
                          logged_in_before: true,
                        },
                        function updatepass(err, user) {
                          if (err) {
                            return next(err)
                          }
                          req.flash("success_msg", "Password Changed")
                          res.redirect("/profile")
                        }
                      )
                    })
                  })
                }
              }
            })
          }
          break
        default:
      }
    })
  }

  static uploadPicture(req, res, next) {
    const now = moment().toISOString()
    const body = req.body
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    if (!req.files[0]) {
      req.flash("error_msg", "Error Occured profile not updated")
      res.redirect("/profile")
    } else {
      const dest1 = `uploads/${req.files[0].filename}`
      InternalDal.update(
        { _id: body.userid },
        { picture: dest1, updated_at: now },
        function updatepass(err, idocs) {
          if (err) {
            return next(err)
          }
          req.flash("success_msg", "Profile Changed successfully")
          res.redirect("/profile")
        }
      )
    }
  }

  static addProducts(req, res, next) {
    const now = moment().toISOString()
    const body = req.body
    body.created_by = req.user._id
    body.created_at = now
    if (!req.files) {
      req.flash("error_msg", "File must be selected")
      res.redirect("/products")
    } else {
      if (req.files.length > 8) {
        req.flash("error_msg", "Your Item selection exceeds the limit")
        res.redirect("/products")
      } else {
        const insertQuery = {
          video: `uploads/${req.files[7].filename}`,
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
        ImageDal.create(insertQuery, (err, idoc) => {
          if (err) {
            return next(err)
          }
          body.img = idoc._id
          InternalDal.get({ user: req.user._id }, (err, doc) => {
            if (err) {
              return next(err)
            }
            switch (doc.brands) {
              case "null":
                req.flash(
                  "error_msg",
                  "You have to assign yourself what brand you are!"
                )
                res.redirect("/products")
                break
              default:
                body.brands = doc.brands
                ProductDal.create(body, (err, pdoc) => {
                  if (err) {
                    return next(err)
                  }
                  req.flash("success_msg", "Product Created")
                  res.redirect("/products")
                })
            }
          })
        })
      }
    }
  }

  static removeProducts(req, res, next) {
    const productid = req.body
    const query = { _id: productid }
    ProductDal.delete(query, (err, idoc) => {
      if (err) {
        return next(err)
      }
      const imageQuery = { _id: idoc.img }
      ImageDal.delete(imageQuery, (err, doc) => {
        if (err) {
          return next(err)
        }
        if (doc.img0) {
          removePicture(doc.img0, () => {})
        }
        if (doc.img1) {
          removePicture(doc.img1, () => {})
        }
        if (doc.img2) {
          removePicture(doc.img2, () => {})
        }
        if (doc.img3) {
          removePicture(doc.img3, () => {})
        }
        if (doc.img4) {
          removePicture(doc.img4, () => {})
        }
        if (doc.img5) {
          removePicture(doc.img5, () => {})
        }
        if (doc.img6) {
          removePicture(doc.img6, () => {})
        }
        if (doc.img7) {
          removePicture(doc.img7, () => {})
        }
      })
      /** everything is going to be removed from the product side
       * Favorite
       * Reviews
       * Checkouts
       * Sales
       * wishlists
       * carts
       */
      FavorDal.delete({ product: productid }, (err, fdoc) => {
        if (err) {
          return next(err)
        }
        const quency = { $pull: { favorite: fdoc._id } }
        /** time pull the product from customer */
        CustoDal.update(quency, {}, function UpdateCustomer(err, cDoc) {
          if (err) {
            return next(err)
          }
        })
      })
      RevieDal.delete({ product: productid }, (err, rdoc) => {
        if (err) {
          return next(err)
        }
        const quency = { $pull: { reviews: rdoc._id } }
        /** time pull the product from customer */
        CustoDal.update(quency, {}, function UpdateCustomer(err, cDoc) {
          if (err) {
            return next(err)
          }
        })
        if (rdoc.img) {
          removePicture(rdoc.img, () => {})
        }
      })
      CartsDal.delete({ product: productid }, (err, caDoc) => {
        if (err) {
          return next(err)
        }
      })
      WishsDal.delete({ product: productid }, (err, wDoc) => {
        if (err) {
          return next(err)
        }
      })
      NotifDal.delete({ product: productid }, (err, nDoc) => {
        if (err) {
          return next(err)
        }
      })
      SalesDal.delete({ products: productid }, (err, sDoc) => {
        if (err) {
          return next(err)
        }
        CheckDal.delete({ _id: sDoc.checkouts._id }, (err, chDoc) => {
          if (err) {
            return next(err)
          }
        })
      })

      req.flash("success_msg", "Product Removed")
      res.redirect("/products")
    })
  }

  static BankDetail(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  res.render("bankdetails", {
                                    user: cats,
                                    order: iCheckedOuts,
                                    url: page,
                                    count_unread: iChats.length,
                                    annual: iAnnual,
                                    Brands: iBrands,
                                    ABrands: aBrand,
                                    products: iProduct,
                                    solditems: iSales,
                                    soldit: iSoldit,
                                    notify: notification,
                                    annaulreport: salersAnnual,
                                    count_products_sold: iSales.length,
                                    count_top_brands: iBrands.length,
                                    totalSum: thousandsSeparators(sum),
                                  })
                                }
                              )
                            }
                          )
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
    })
  }

  static AddBankDetail (req, res, next) {
    const body = req.body
    BankDetailDal.create(body, (err, doc) => {
      if (err) {
        next(err)
      }
      req.flash("success_msg", "Bank Detail Added")
      res.redirect("/bankdetails")
    })
  }

  static Curtin(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  res.render("curtin", {
                                    user: cats,
                                    order: iCheckedOuts,
                                    url: page,
                                    count_unread: iChats.length,
                                    annual: iAnnual,
                                    Brands: iBrands,
                                    ABrands: aBrand,
                                    products: iProduct,
                                    solditems: iSales,
                                    soldit: iSoldit,
                                    notify: notification,
                                    annaulreport: salersAnnual,
                                    count_products_sold: iSales.length,
                                    count_top_brands: iBrands.length,
                                    totalSum: thousandsSeparators(sum),
                                    chats: iChats,
                                    moment: moment
                                  })
                                }
                              )
                            }
                          )
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
    })
  }

  static CustomerdataInfo(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  CustoDal.get(
                                    { _id: req.params.id },
                                    function getAll(err, customers) {
                                      if (err) {
                                        return next(err)
                                      }
                                      OrderDal.getCollection(
                                        { customer: customers._id },
                                        {},
                                        (err, orderobj) => {
                                          if (err) {
                                            next(err)
                                          }
                                          res.render("customerdatainfo", {
                                            user: cats,
                                            order: iCheckedOuts,
                                            url: page,
                                            cust: customers,
                                            orderobj,
                                            count_unread: iChats.length,
                                            annual: iAnnual,
                                            Brands: iBrands,
                                            ABrands: aBrand,
                                            products: iProduct,
                                            solditems: iSales,
                                            soldit: iSoldit,
                                            notify: notification,
                                            annaulreport: salersAnnual,
                                            count_products_sold: iSales.length,
                                            count_top_brands: iBrands.length,
                                            totalSum: thousandsSeparators(sum),
                                            chats: iChats,
                                            moment: moment
                                          })
                                        }
                                      )
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static CustomerData(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  CustoDal.getCollection(
                                    { created_by: cats._id },
                                    {},
                                    function getAll(err, customers) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("customerdata", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        cust: customers,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static ComingSoon(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  res.render("comingsoon", {
                                    user: cats,
                                    order: iCheckedOuts,
                                    url: page,
                                    count_unread: iChats.length,
                                    annual: iAnnual,
                                    Brands: iBrands,
                                    ABrands: aBrand,
                                    products: iProduct,
                                    solditems: iSales,
                                    soldit: iSoldit,
                                    notify: notification,
                                    annaulreport: salersAnnual,
                                    count_products_sold: iSales.length,
                                    count_top_brands: iBrands.length,
                                    totalSum: thousandsSeparators(sum),
                                    chats: iChats,
                                    moment: moment
                                  })
                                }
                              )
                            }
                          )
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
    })
  }

  static Invoice(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  OrderDal.get(
                                    { _id: req.params.id },
                                    function getOne(err, orders) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("invoice", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        orders,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static Order(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  OrderDal.getCollection(
                                    { created_by: cats._id },
                                    {},
                                    function getAll(err, orders) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("order", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        orders,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static chat(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CustoDal.getCollection(
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
                const NotifyQUuery = {
                  $and: [
                    { salers: cats.internal._id },
                    { is_read: false },
                  ],
                }
                NotifDal.getCollection(
                  NotifyQUuery,
                  options,
                  function getAll(err, notification) {
                    if (err) {
                      return next(err)
                    }
                    res.render("chat", {
                      user: cats,
                      customers: iCustomer,
                      url: page,
                      chat: iChats,
                      status: itkn,
                      read_stat: iRead,
                      notify: notification,
                      count_unread: iRead.length,
                      chats: iRead,
                      moment: moment
                    })
                  }
                )
              })
            })
          })
        }
      )
    })
  }

  static Payout(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  res.render("payout", {
                                    user: cats,
                                    order: iCheckedOuts,
                                    url: page,
                                    count_unread: iChats.length,
                                    annual: iAnnual,
                                    Brands: iBrands,
                                    ABrands: aBrand,
                                    products: iProduct,
                                    solditems: iSales,
                                    soldit: iSoldit,
                                    notify: notification,
                                    annaulreport: salersAnnual,
                                    count_products_sold: iSales.length,
                                    count_top_brands: iBrands.length,
                                    totalSum: thousandsSeparators(sum),
                                    chats: iChats,
                                    moment: moment
                                  })
                                }
                              )
                            }
                          )
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
    })
  }

  static Overview(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  res.render("overview", {
                                    user: cats,
                                    order: iCheckedOuts,
                                    url: page,
                                    count_unread: iChats.length,
                                    annual: iAnnual,
                                    Brands: iBrands,
                                    ABrands: aBrand,
                                    products: iProduct,
                                    solditems: iSales,
                                    soldit: iSoldit,
                                    notify: notification,
                                    annaulreport: salersAnnual,
                                    count_products_sold: iSales.length,
                                    count_top_brands: iBrands.length,
                                    totalSum: thousandsSeparators(sum),
                                    chats: iChats,
                                    moment: moment
                                  })
                                }
                              )
                            }
                          )
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
    })
  }

  static Analytics(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  OrderDal.getCollection(
                                    { created_by: cats._id },
                                    {},
                                    function getAll(err, orders) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("analytics", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        orders,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static AddCustomerForm(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  res.render("addcustomer", {
                                    user: cats,
                                    order: iCheckedOuts,
                                    url: page,
                                    count_unread: iChats.length,
                                    annual: iAnnual,
                                    Brands: iBrands,
                                    ABrands: aBrand,
                                    products: iProduct,
                                    solditems: iSales,
                                    soldit: iSoldit,
                                    notify: notification,
                                    annaulreport: salersAnnual,
                                    count_products_sold: iSales.length,
                                    count_top_brands: iBrands.length,
                                    totalSum: thousandsSeparators(sum),
                                    chats: iChats,
                                    moment: moment
                                  })
                                }
                              )
                            }
                          )
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
    })
  }

  static EditCustomerForm(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  CustoDal.get(
                                    { _id: req.params.id },
                                    function getAll(err, customers) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("editcustomer", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        cust: customers,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static AddCustomer(req, res, next) {
    const body = req.body
    let dest1 = ""
    if (req.files.length > 0) {
      dest1 = `uploads/${req.files[0].filename}`
    } else {
      dest1 = "images/default_profile.png"
    }
    body.user = req.user._id
    body.created_by = req.user.id
    body.picture = dest1
    CustoDal.create(body, (err, doc) => {
      if (err) {
        next(err)
      }
      const customers = doc._id
      UserDal.update({ _id: req.user._id }, customers, (err, user) => {
        if (err) {
          next(err)
        }
        req.flash("success_msg", "Customer Added")
        res.redirect("/customerdata")
      })
    })
  }

  static EditCustomer(req, res, next) {
    const body = req.body
    let dest1 = ""
    if (req.files.length > 0) {
      dest1 = `uploads/${req.files[0].filename}`
      CustoDal.get({ _id: body.id }, (err, doc) => {
        const fileName = doc.picture.split("/")[1]
        removePicture(`/${fileName}`, () => {})
      })
    } else {
      CustoDal.get({ _id: body.id }, (err, doc) => {
        dest1 = doc.picture
      })
    }
    body.picture = dest1
    CustoDal.update({ _id: body.id }, body, (err, doc) => {
      if (err) {
        next(err)
      }
      req.flash("success_msg", "Customer Edited")
      res.redirect("/customerdata")
    })
  }

  static DeleteCustomer(req, res, next) {
    const removeId = req.body.customer_id
    CustoDal.delete({ _id: removeId }, (err, doc) => {
      if (err) {
        return next(err)
      }
      if (doc.picture) {
        const folder = doc.picture.split("/")[0]
        const fileName = doc.picture.split("/")[1]
        if (folder !== "images") {
          removePicture(`/${fileName}`, () => {})
        }
      }
      req.flash("success_msg", "Customer Removed")
      res.redirect("/customerdata")
    })
  }

  static CustomerDataInfoAddTagForm(req, res, next) {
    const options = {}
    const custId = req.params.id
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  CustoDal.get(
                                    { _id: req.params.id },
                                    function getAll(err, customers) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("customeraddtag", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        cust: customers,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static CustomerDataInfoAddTag(req, res, next) {
    const body = {
      tags: req.body.tags.split(","),
    }
    CustoDal.update({ _id: req.body.id }, body, (err, doc) => {
      if (err) {
        next(err)
      }
      req.flash("success_msg", "Tags Modified")
      res.redirect(`/customerdatainfo/${req.body.id}`)
    })
  }

  static AddOrderForm(req, res, next) {
    const options = {}
    const page = req.originalUrl
    UserDal.get({ _id: req.user._id }, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      CheckDal.getCollection({}, options, function getAll(err, iCheckedOuts) {
        if (err) {
          return next(err)
        }
        let sum = 0
        iCheckedOuts.forEach(elements => {
          sum += elements.amount
        })
        const readStatus = { salers: cats.internal._id, is_read: false }
        MessageDal.getCollection(readStatus, options, function getAll(
          err,
          iChats
        ) {
          if (err) {
            return next(err)
          }
          BrandDal.getCollection({ is_top: true }, options, function getAll(
            err,
            iBrands
          ) {
            if (err) {
              return next(err)
            }
            BrandDal.getCollection({}, options, function getAll(err, aBrand) {
              if (err) {
                return next(err)
              }
              ProductDal.getCollection({}, options, function getAll(
                err,
                iProduct
              ) {
                if (err) {
                  return next(err)
                }
                SalesDal.getCollection(
                  { products: iProduct },
                  options,
                  function getAll(err, iSales) {
                    if (err) {
                      return next(err)
                    }
                    const dateObj = new Date()
                    const monthName = dateObj.toLocaleString("default", {
                      month: "long",
                    })
                    const checkMonth = monthName
                    const checkYears = dateObj.getFullYear()
                    CheckDal.getCollection(
                      { checkYear: checkYears },
                      options,
                      function getAll(err, iAnnual) {
                        if (err) {
                          return next(err)
                        }
                        SalesDal.getCollection({}, options, function getAll(
                          err,
                          iSoldit
                        ) {
                          if (err) {
                            return next(err)
                          }
                          SalesDal.getCollection(
                            { checkYear: checkYears },
                            options,
                            function getAll(err, salersAnnual) {
                              if (err) {
                                return next(err)
                              }
                              const NotifyQUuery = {
                                $and: [
                                  { salers: cats.internal._id },
                                  { is_read: false },
                                ],
                              }
                              NotifDal.getCollection(
                                NotifyQUuery,
                                options,
                                function getAll(err, notification) {
                                  if (err) {
                                    return next(err)
                                  }
                                  CustoDal.getCollection(
                                    { created_by: cats._id },
                                    {},
                                    function getAll(err, customers) {
                                      if (err) {
                                        return next(err)
                                      }
                                      res.render("addorder", {
                                        user: cats,
                                        order: iCheckedOuts,
                                        url: page,
                                        customers,
                                        count_unread: iChats.length,
                                        annual: iAnnual,
                                        Brands: iBrands,
                                        ABrands: aBrand,
                                        products: iProduct,
                                        solditems: iSales,
                                        soldit: iSoldit,
                                        notify: notification,
                                        annaulreport: salersAnnual,
                                        count_products_sold: iSales.length,
                                        count_top_brands: iBrands.length,
                                        totalSum: thousandsSeparators(sum),
                                        chats: iChats,
                                        moment: moment
                                      })
                                    }
                                  )
                                }
                              )
                            }
                          )
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
    })
  }

  static AddOrder(req, res, next) {
    const body = req.body
    body.user = req.user._id
    body.created_by = req.user._id
    OrderDal.create(body, (err, doc) => {
      if (err) {
        next(err)
      }
      const timeLineData = {
        order: doc._id,
        action_message: `Bought ${doc.product.name}`,
        action_description: doc.product.description,
        product_name: doc.product.name,
        product_description: doc.product.description,
        created_at: doc.created_at,
      }
      TimeLineDal.create(timeLineData, (err, timel) => {
        if (err) {
          return next(err)
        }
        const orderDalData = {
          timeline: timel._id,
        }
        OrderDal.update({ _id: doc._id }, orderDalData, (err, orderdoc) => {
          if (err) {
            next(err)
          }
          UserDal.get({ _id: req.user._id }, (err, user) => {
            if (err) {
              next(err)
            }
            const data = {
              customers: doc.customer,
              salers: user.internal,
              products: doc.product,
              title: doc.message,
              order: doc._id,
              created_by: req.user._id,
            }
            NotifDal.create(data, (err, noti) => {
              if (err) {
                next(err)
              }
              req.flash("success_msg", "Order Added")
              res.redirect("/order")
            })
          })
        })
      })
    })
  }

  static DeleteOrder(req, res, next) {
    const removeId = req.body
    const query = { _id: removeId }
    const userId = req.user.id
    UserDal.get({ _id: userId }, function getUser(err, user) {
      if (err) {
        next(err)
      }
      OrderDal.get(query, function getOrder(err, order) {
        if (err) {
          next(err)
        }
        const body = {
          user: user._id,
          created_by: user._id,
          customer: order.customer,
          product: order.product,
          product_quantity: order.product_quantity,
          order_id: order.order_id,
          message: order.message,
          status: order.status,
          shipping_address: order.shipping_address,
          tracking_n: order.tracking_n,
          created_at: order.created_at,
        }
        OrderBackupDal.create(body, (err, doc) => {
          if (err) {
            next(err)
          }
          TimeLineDal.delete({ order: order._id }, (err, timed) => {
            if (err) {
              next(err)
            }
            OrderDal.delete(query, (err, doc) => {
              if (err) {
                return next(err)
              }
              req.flash("success_msg", "Order Removed")
              res.redirect("/order")
            })
          })
        })
      })
    })
  }

  static async SearchOrder(req, res, next) {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            order_id: `${req.query.query}`,
          },
        },
      ])
      res.send(result)
    } catch (error) {
      console.error(error)
    }
  }

  static async GetOrder(req, res, next) {
    try {
      const result = await Order.findOne({ order_id: req.params.id })
      res.send(result)
    } catch (error) {
      console.error(error)
    }
  }

  static updateInvoice(req, res, next) {
    const body = req.body
    const check = "checkbox" in body
    const updates = {
      status: check ? "fulfilled" : "pending",
      note: body.note,
    }
    OrderDal.get({ _id: body.id }, (err, order) => {
      if (err) {
        next(err)
      }
      if (order.tracking_n.length === 0) {
        const randomNumber =
          Math.floor(Math.random() * (487541432 - 18794543 + 1)) + 18794543
        updates.tracking_n = randomNumber
      }
      OrderDal.update({ _id: body.id }, updates, (err, doc) => {
        if (err) {
          next(err)
        }
        req.flash("success_msg", "Order Updated")
        res.redirect(req.get("referer"))
      })
    })
  }

  static async showcaseEditDetail(req, res, next) {
    try {
      const user = await UserDal.getUser(req.user._id);
      const NotifyQUuery = {
        $and: [
          {
            salers: req.user.internal,
          },
          { is_read: false },
        ],
      }
      const notify = await NotifDal.getNotifications(NotifyQUuery, {});
      const iChats = await MessageDal.getMessages({ salers: req.user.internal, is_read: false }, {});
      
      const {brands:iBrand} = await Internal.findOne({ _id: req.user.internal });
      const brand = await Brands.findOne({ _id: iBrand });
      let BrandTitle;
      if (brand.show_case_video_title && brand.show_case_video_title.length > 10) {
        BrandTitle = brand.show_case_video_title.substring(0, 50) + "...";
      } else {
        BrandTitle = brand.show_case_video_title;
      }

      res.render("addbranddetail", {
        user: user,
        url: req.originalUrl,
        count_unread: iChats,
        notify: notify,
        chats: iChats,
        moment: moment,
        brand: brand,
        videoTitle: BrandTitle
      })
    } catch (error) {
      return next(error);
    }
  }

  static async showcaseUpdateDetail(req, res, next) {
    try {
      const now = moment().toISOString()
      const body = req.body
      let video = req.files.find(el => el.fieldname == "video");
      let data = {}
      let about = body.about_store;
      let PrivacyPolicy = body.public_policy;
      let RefundPolicy = body.refund_policy;
      let ShippingPolicy = body.shiping_policy;
      let TermsOfServices = body.terms_of_services;
      if (about){
        data["about"] = about;
      }
      if (PrivacyPolicy){
        data["privacy_policy"] = PrivacyPolicy;
      }                
      if (RefundPolicy){
        data["refund_policy"] = RefundPolicy;
      }        
      if (ShippingPolicy){
        data["shiping_policy"] = ShippingPolicy;
      }
      if (TermsOfServices){
        data["terms_of_services"] = TermsOfServices;
      }
      if(video){
        data["show_case_video"] = `uploads/${video.filename}`;
        data["show_case_video_title"] = video.originalname;
      }
      const user = await UserDal.getUser(req.user._id);
      const NotifyQUuery = {
        $and: [
          {
            salers: req.user.internal,
          },
          { is_read: false },
        ],
      }

      const notify = await NotifDal.getNotifications(NotifyQUuery, {});
      const iChats = await MessageDal.getMessages({ salers: req.user.internal, is_read: false }, {});

      if(Object.keys(data).length){
          BrandDal.update({_id: user.internal.brands._id}, data, function updateBrandDetail(err, doc) {
            if (err){
              req.flash("error_msg", "Failed to update showcase")
              res.redirect("/showcase/editdetail")
            } else {
              ActivitiesDal.create(
                {
                  activity_type: "Update brand Information",
                  activity_detail: "Brand information is updated in this activity.",
                  created_at: now,
                  created_by: req.user._id,
                },
                (err, idoc) => {
                  if (err) {
                    return next(err)
                  }
                }
              )
              req.flash("success_msg","Showcase updated successfully")
              res.redirect("/showcase/editdetail")
            }
          });
      }
    } catch (error) {
      return next(error);
    }
  }

  static async showcaseEdit(req, res, next) {
    try {
      const user = await UserDal.getUser(req.user._id);
      const NotifyQUuery = {
        $and: [
          {
            salers: req.user.internal,
          },
          { is_read: false },
        ],
      }
      const notify = await NotifDal.getNotifications(NotifyQUuery, {});
      const iChats = await MessageDal.getMessages({ salers: req.user.internal, is_read: false }, {});
      
      const {brands:iBrand} = await Internal.findOne({ _id: req.user.internal });
      const brand = await Brands.findOne({ _id: iBrand });

      res.render("showcaseedit", {
        user: user,
        url: req.originalUrl,
        count_unread: iChats,
        notify: notify,
        chats: iChats,
        moment: moment,
        brand: brand
      })
    } catch (error) {
      return next(error);
    }
  }

  static async showcaseUpdate(req,res,next) {
    try {
      if (req.files){
        const user = await UserDal.getUser(req.user._id);
        
        let data = {}
        let logo = req.files.find(el => el.fieldname == "logo");
        let banner = req.files.find(el => el.fieldname == "banner");
        
        if (logo){
          data["img"] = `uploads/${logo.filename}`;
        }
        if (banner){
          data["banner"] = `uploads/${banner.filename}`;
        }
        if(Object.keys(data).length){
          BrandDal.update({_id: user.internal.brands._id}, data, function updateBrand(err, doc) {
            if (err){
              req.flash("error_msg", "Failed to update showcase")
              res.redirect("/showcase/edit")
            }
            if(user.internal.brands.img){
              removePicture(user.internal.brands.img, () => {});
            }
            if(user.internal.brands.banner){
              removePicture(user.internal.brands.banner, () => {});
            }
            req.flash("success_msg","Showcase updated successfully")
            res.redirect("/showcase/edit")
          });
        }else{
          req.flash("error_msg", "No changes made")
          res.redirect("/showcase/edit")
        }
      }else{
        req.flash("error_msg", "No changes made")
        res.redirect("/showcase/edit")
      }
    } catch (error) {
      req.flash("error_msg", "Failed to update showcase")
      res.redirect("/showcase/edit")
    }
  }

  static async showcaseCreate(req,res){
    try {
      const now = moment().toISOString()
      const user = await UserDal.getUser(req.user._id);
      if (!req.files){
        req.flash("error_msg", "Please select a file")
        return res.redirect("/showcase")
      }
      let media = []
      let images = req.files.filter(el => el.mimetype.startsWith("image/")).length;
      let videos = req.files.filter(el => el.mimetype.startsWith("video/")).length;
      if(images > 4){
        req.flash("error_msg", "Only 4 images can be posted at a time.")
        return res.redirect("/showcase")
      }
      if (videos > 1) {
        req.flash("error_msg", "Only 1 video can be posted at a time.")
        return res.redirect("/showcase")
      }

      for (let file of req.files){
        media.push({type: file.mimetype.split("/")[0], path: `uploads/${file.filename}`});
      }
      let data = {
        brand: user.internal.brands._id,
        description: req.body.description,
        media: media,
        created_by: req.user._id,
        created_at: now
      }
      ShowCaseDal.create(data, function addShowcase(err,doc){
        if (err){
          req.flash("error_msg", "Failed to add a post.")
          res.redirect("/showcase")
        } else {
          ActivitiesDal.create(
              {
                activity_type: "Post Added",
                activity_detail: req.body.description,
                created_at: now,
                created_by: req.user._id,
              },
              (err, idoc) => {
                if (err) {
                  return next(err)
                }
              }
            )
        }
        req.flash("success_msg", "Post added successfully.")
        res.redirect("/showcase")
      });
    } catch (error) {
      res.send(error);
    }
  }

  static async showcaseGet(req,res){
    try {
      const user = await UserDal.getUser(req.user._id)
      const followedBrands = await BrandDal.getFollowedBrands(user.internal.brands._id)
      ShowCaseDal.getPaginatedResults(
        {brand : { $in: [user.internal.brands._id, ...followedBrands] }},
        req.query.page || 1,
        req.query.limit || 10,
        async function getResult(err, docs) {
          if (err) {
            return res.status(400).json({ error: error }).end()
          }
          let showcases = await ShowCaseCommentDal.fetchShowCaseComments(
            docs.docs
          )
          showcases = await ShowCaseLikeDal.fetchShowCaseLikes(
            user.internal.brands._id,
            showcases
          )
          res.app.render(
            "partials/posts",
            { posts: showcases, timeSince: timeSince, user: user },
            function render(err, html) {
              if (err) {
                return res.status(400).json({ error: err }).end()
              }
              return res
                .status(200)
                .json({
                  html: html,
                  pages: docs.pages,
                  page: parseInt(docs.page),
                })
                .end()
            }
          )
        }
      )
    } catch (error) {
      return res.status(400).json({error: error}).end();
    }
  }

  static async showcaseLike(req,res){
    try {
      const user = await UserDal.getUser(req.user._id)
      const like = await ShowCaseLikeDal.createSync({
        showcase: req.body.showcase,
        created_by: user.internal.brands._id,
      },req.body.val)

      let likes = await ShowCaseLikeDal.getRecentShowCaseLikes(
        req.body.showcase,
        user.internal.brands._id
      )
      let is_liked = await ShowCaseLikeDal.isLikedByBrand(
        req.body.showcase,
        user.internal.brands._id
      )
      return res.status(200).json({ ...likes, liked: is_liked })
    } catch (error) {
      return res.status(400).json({ error: err })
    }
  }

  static async showcaseComment(req,res){
    try {
      const user = await UserDal.getUser(req.user._id)
      const comment = await ShowCaseCommentDal.createSync({
        showcase: req.body.showcase,
        created_by: user.internal.brands._id,
        comment: req.body.comment,
      })
      let comments = await ShowCaseCommentDal.getRecentShowCaseComments(
        req.body.showcase
      )  
      res.app.render(
        "partials/comment",
        { comments: comments.comments, timeSince: timeSince },
        function (err, html) {
          if (err) {
            return res.status(400).json({ error: err }).end()
          }
          return res.status(200).json({ message: comment, html: html, count: comments.count }).end()
        }
      )

    } catch (error) {
      return res.status(400).json({ error: error }).end()
    }
  }

  static async addfollower(req,res,next){
    try {
      const user = await UserDal.getUser(req.user._id);
      let data = {}
      let options = {}
      if(req.body && req.body.type == 'follow' && req.body.brandid){
        data['followers'] = req.body.brandid;
      } else if(req.body && req.body.type == 'unfollow' && req.body.brandid) {
        data['followedby'] = req.body.brandid;
      }
      if(Object.keys(data).length){
        if(req.body.type == 'follow'){
          BrandDal.update({_id: req.body.brandid}, {$push: {followers: user.internal.brands._id}}, function pushfollower(err, doc) {
            InternalDal.getCollection({_id : { $ne: user.internal._id }}, options, function getAll(err, ochk) {
              BrandDal.getCollection({followers : { $in: user.internal.brands._id }}, options, function get(error, followed){
                res.app.render(
                  "partials/suggestedfollowers",
                  { otherbrands: ochk, user:user },
                  function (errone, htmlsuggested) {
                    if (errone) {
                      return res.status(400).json({ error: errone }).end()
                    }
                    res.app.render('partials/followers', 
                    { followers: followed, user:user },
                    function (errtwo, htmlall) {
                      if (errtwo) {
                        return res.status(400).json({ error: errtwo }).end()
                      }
                      return res.status(200).json({ status: 200, SuggestListHtml: htmlsuggested,  htmlall: htmlall }).end()
                    })
                  }
                )
              });
            });
          });
        } else if(req.body.type == 'unfollow') {
          BrandDal.update({_id: req.body.brandid}, {$pullAll: {followers: [user.internal.brands._id]}}, function pullfollower(err, doc) {
            InternalDal.getCollection({_id : { $ne: user.internal._id }}, options, function getAll(err, ochk) {
              BrandDal.getCollection({followers : { $in: user.internal.brands._id }}, options, function get(error, followed){
                res.app.render(
                  "partials/suggestedfollowers",
                  { otherbrands: ochk, user:user },
                  function (errone, htmlsuggested) {
                    if (errone) {
                      return res.status(400).json({ error: errone }).end()
                    }
                    res.app.render('partials/followers', 
                    { followers: followed, user:user },
                    function (errtwo, htmlall) {
                      if (errtwo) {
                        return res.status(400).json({ error: errtwo }).end()
                      }
                      return res.status(200).json({ status: 200, SuggestListHtml: htmlsuggested,  htmlall: htmlall }).end()
                    })
                  }
                )
              });
            });
          });
        }
      }
    } catch (error) {
      return res.status(400).json({error: error}).end();
    }
  }
  
  static async getFollwers(req,res){
    try {
      const user = await UserDal.getUser(req.user._id)
      // const followedBrands = await BrandDal.getFollowedBrands(user.internal.brands._id)
      BrandDal.getPaginatedResults(
        {followers : { $in: user.internal.brands._id }},
        req.query.page || 1,
        req.query.limit || 10,
        async function getResult(err, docs) {
          if (err) {
            return res.status(400).json({ error: error }).end()
          }
          res.app.render(
            "partials/followers",
            { followers: docs.docs, user:user },
            function render(err, html) {
              if (err) {
                return res.status(400).json({ error: err }).end()
              }
              return res
                .status(200)
                .json({
                  html: html,
                  pages: docs.pages,
                  page: parseInt(docs.page),
                })
                .end()
            }
          )
        }
      )
    } catch (error) {
      return res.status(400).json({error: error}).end();
    }
  }  

  static async getSuggested(req,res){
    try {
      const user = await UserDal.getUser(req.user._id)
      InternalDal.getPaginatedResults(
        {_id : { $ne: user.internal._id }},
        req.query.page || 1,
        req.query.limit || 10,
        async function getResult(err, docs) {
          if (err) {
            return res.status(400).json({ error: error }).end()
          }
          res.app.render(
            "partials/suggestedfollowers",
            { otherbrands: docs.docs, user:user },
            function render(err, html) {
              if (err) {
                return res.status(400).json({ error: err }).end()
              }
              return res
                .status(200)
                .json({
                  html: html,
                  pages: docs.pages,
                  page: parseInt(docs.page),
                })
                .end()
            }
          )
        }
      )
    } catch (error) {
      return res.status(400).json({error: error}).end();
    }
  }  

  static async getFollowings(req,res){
    try {
      const user = await UserDal.getUser(req.user._id)
      InternalDal.getPaginatedResults(
        {brands : { $in: user.internal.brands.followers }},
        req.query.page || 1,
        req.query.limit || 10,
        async function getResult(err, docs) {
          if (err) {
            return res.status(400).json({ error: error }).end()
          }
          res.app.render(
            "partials/brandfollowings",
            { followers: docs.docs, user:user },
            function render(err, html) {
              if (err) {
                return res.status(400).json({ error: err }).end()
              }
              return res
                .status(200)
                .json({
                  html: html,
                  pages: docs.pages,
                  page: parseInt(docs.page),
                })
                .end()
            }
          )
        }
      )
    } catch (error) {
      return res.status(400).json({error: error}).end();
    }
  }

}

export default WebAppController

