import moment from "moment"
import async from "async"
import settings from "../../../../config/server"
import Checkout from "../dal/checkout"
import CartsDal from "../dal/carts"
import CustomerDal from "../dal/customers"
import ProductDal from "../dal/product"
import SalesDal from "../dal/sales"
import NotifiDal from "../dal/notification"
import InternalDal from "../dal/internal"
import Stripe from "stripe"
import UserDal from "../dal/user"
import CategoryDal from "../dal/category"
import BrandDal from "../dal/brands"
import ReviewDal from "../dal/reviews"
import MessageDal from "../dal/messages"
import FavorDal from "../dal/favorite"
import WishsDal from "../dal/wishlists"
import ShowCaseDal from "../dal/showcase"

const stripe = Stripe(settings.STR_SEC)

function thousandsSeparators(num) {
  const numParts = num.toString().split(".")
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return numParts.join(".")
}

function removeFromCart(req, res, next) {
  const now = moment().toISOString()
  const options = {}
  ProductDal.getCollection({}, options, function getAll(err, cats) {
    if (err) {
      return next(err)
    }
    async.eachSeries(
      cats,
      (data, callback) => {
        const deleteID = data._id
        SalesDal.getCollection({ products: data._id }, options, function getAll(
          err,
          iSales
        ) {
          if (err) {
            return next(err)
          }
          const differences = data.qty - iSales.length
          if (differences <= 0) {
            CartsDal.getCollection(
              { product: data._id },
              options,
              function getAll(err, iCarts) {
                if (err) {
                  return next(err)
                }
                for (let x = 0; x < iCarts.length; x++) {
                  const insertQuery = {
                    title: `${data.name} removed from your Cart`,
                    message: `Sorry For the inconvenience. The item
                      ${data.name}
                      is out of stock. Therefore we have removed it from your cart list. :(`,
                    customers: iCarts[x].customer._id,
                    created_at: now,
                  }
                  NotifiDal.create(insertQuery, (err, save) => {
                    if (err) throw err
                  })
                }
              }
            )
            CartsDal.delete({ product: deleteID }, (err, doc) => {
              if (err) {
                return next(err)
              }
            })
            InternalDal.get({ _id: data.created_by.internal }, function getAll(
              err,
              iUsers
            ) {
              if (err) {
                return next(err)
              }
              const notquery = {
                $and: [
                  { salers: data.created_by.internal },
                  { products: data._id },
                  { is_read: false },
                ],
              }
              NotifiDal.getCollection(notquery, options, function getAll(
                err,
                checkNotification
              ) {
                if (err) {
                  return next(err)
                }
                switch (checkNotification.length) {
                  case 0:
                    const notifySaler = {
                      title: `${data.name} is out of Stock`,
                      message: `Dear ${iUsers.first_name} ! <BR> We want to let you know that your product
                        ${data.name}
                        Store name 
                        ${data.store}
                         is out of stock. Please update your Item`,
                      products: data._id,
                      salers: iUsers._id,
                      created_at: now,
                    }
                    NotifiDal.create(notifySaler, (err, save) => {
                      if (err) throw err
                    })
                    break
                  default:
                }
              })
            })
          }
          callback(null)
        })
      },
      function done(err) {
        if (err) {
          return next(err)
        }
      }
    )
  })
}

setInterval(removeFromCart, 21600000) // 6hrs

class CheckoutController {
  constructor() {}

  static noop(req, res, next) {
    res.json({
      error: false,
      message: "To be implemented!",
    })
  }

  static validateCheckout(req, res, next, id) {
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
      Checkout.get({ _id: id }, (err, doc) => {
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
            msg: `Checkout _id ${id} not found`,
          })
        }
      })
    }
  }

  static showlists(req, res, next) {
    const options = {}
    Checkout.getCollection(
      { customer: req._user.customers },
      options,
      function getAll(err, cats) {
        if (err) {
          return next(err)
        }
        switch (cats.length) {
          case 0:
            res.json(cats)
            break
          default:
            let result = 0
            let pname
            let btitle
            let catego
            let i
            let countMany
            for (i = 0; i < cats.length; i++) {
              countMany = cats.indexOf(cats[i].product._id)
            }
            cats.forEach(element => {
              pname = element.product.name
              btitle = element.product.brands.title
              catego = element.product.category.name
              result += element.product.price
            })
            res.json({
              data: cats,
              total: thousandsSeparators(result),
            })
        }
      }
    )
  }

  static fetchAll(req, res, next) {
    const options = {}
    Checkout.getCollection({}, options, function getAll(err, cats) {
      if (err) {
        return next(err)
      }
      res.json(cats)
    })
  }

  static fetchOne(req, res, next) {
    res.json(req.doc)
  }

  static update(req, res, next) {
    const body = req.body
    Checkout.update(
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

  static create(req, res, next) {
    const body = req.body
    const now = moment().toISOString()
    req
      .checkBody("amount")
      .notEmpty()
      .withMessage(" amount should not be empty")
    req
      .checkBody("billing")
      .notEmpty()
      .withMessage(" Billing Address should not be empty")
    req
      .checkBody("mobile")
      .notEmpty()
      .withMessage(" Mobile should not be empty")
    req
      .checkBody("country")
      .notEmpty()
      .withMessage(" country should not be empty")
    req.checkBody("state").notEmpty().withMessage(" state should not be empty")
    req
      .checkBody("zipcode")
      .notEmpty()
      .withMessage(" zipcode should not be empty")
      .len(4)
      .withMessage("4 digit code")
    req
      .checkBody("cardname")
      .notEmpty()
      .withMessage(" Card Name should not be empty")
    req
      .checkBody("cardnumber")
      .notEmpty()
      .withMessage(" Card Number should not be empty")
    req
      .checkBody("cardExpirmont")
      .notEmpty()
      .withMessage(" Card Exiration Month should not be empty")
      .len(1, 2)
      .withMessage("Enter the month number maximum two digit number")
    req
      .checkBody("cardExpirYear")
      .notEmpty()
      .withMessage(" Card Exiration Year should not be empty")
      .len(4)
      .withMessage("Enter the Year must be Four digits")
    req.checkBody("cvv").notEmpty().withMessage("CVV should not be empty")
    const validationErrors = req.validationErrors()
    if (validationErrors) {
      res.status(400)
      res.json(validationErrors)
      return
    }
    body.created_at = now
    body.created_by = req._user._id
    const dateObj = new Date()
    const monthName = dateObj.toLocaleString("default", { month: "long" })
    body.checkMonth = monthName
    body.checkYear = dateObj.getFullYear()
    const options = {}
    CustomerDal.get({ _id: req._user.customers }, function getAll(err, iUser) {
      if (err) {
        return next(err)
      }
      // this is for stripe
      const amount = Math.round(req.body.amount * 100)
      let stripeResponse = {}
      Stripe.tokens
        .create({
          card: {
            number: req.body.cardnumber,
            exp_month: req.body.cardExpirmont,
            exp_year: req.body.cardExpirYear,
            cvc: req.body.cvv,
          },
        })
        .then(token =>
          Stripe.customers
            .create({
              email: req._user.customers.email,
              source: token.id,
            })
            .then(
              customer =>
                Stripe.charges.create({
                  amount,
                  currency: "usd",
                  description: `Customer name 
                    ${iUser.full_name}
                    email address 
                    ${iUser.email}`,
                  customer: customer.id,
                }),
              Checkout.create(body, (err, saved) => {
                if (err) {
                  return next(err)
                }
                res.status(200).json({ msg: "Payment Successful", status: 200 })
                CartsDal.getCollection(
                  { customer: req._user.customers },
                  {},
                  (err, iCart) => {
                    if (err) {
                      return next(err)
                    }
                    let i
                    for (i = 0; i < iCart.length; i++) {
                      body.products = iCart[i].product._id
                      ;(body.checkouts = saved._id),
                        (body.brands = iCart[i].product.brands._id)
                      SalesDal.create(body, (err, soldItems) => {
                        if (err) {
                          return next(err)
                        }
                      })
                    }
                  }
                )
                CartsDal.delete(
                  { customer: req._user.customers },
                  (err, doc) => {
                    if (err) {
                      return next(err)
                    }
                  }
                )
              })
            )
            .then(charge => (stripeResponse = charge))
        )
        .catch(err => {
          console.log("Error:", err)
          res.status(err.raw.statusCode).json({
            error: true,
            type: err.raw.type,
            msg: err.raw.message,
            status: err.raw.statusCode,
          })
        })
    })
  }

  static delete(req, res, next) {
    Checkout.delete({ _id: req.doc._id }, (err, doc) => {
      if (err) {
        return next(err)
      }
      res.json(doc)
    })
  }
}

export default CheckoutController
