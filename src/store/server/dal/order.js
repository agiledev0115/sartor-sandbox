import moment from "moment"
import Customer from "../models/customers"
import Order from "../models/order"
import Product from "../models/product"
import TimeLine from "../models/timeline"
import {ObjectID} from "mongodb"

const population = [
  {
    path: "customer",
    model: Customer,
  },
  {
    path: "product",
    model: Product,
  },
  {
    path: "timeline",
    model: TimeLine,
  },
]



class OrderDal {
  constructor() {}

  static get(query, cb) {
    Order.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(OrderData, cb) {
    const searchQuery = {
      username: OrderData.username,
    }
    const OrderModel = new Order(OrderData)

    OrderModel.save(function SaveOrder(err, data) {
      if (err) {
        return cb(err)
      }

      OrderDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Order.findOne(query)
      .populate(population)
      .exec(function deleteOrder(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Order.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()

    Order.findOneAndUpdate(query, updates, {}).exec((err, cust) => {
      if (err) {
        return cb(err)
      }
      cb(null, cust || {})
    })
  }

  static getCollection(query, qs, cb) {
    Order.find(query, {}, qs)
      .sort({ _id: -1 })
      .populate(population)
      .exec(function getOrderCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }

  static getTopSellingProducts(user_id, cb) {
    Order.aggregate([
      { $match: { created_by: { $eq: new ObjectID(user_id) } } },
      { $group: { _id: "$product", count: { $sum: { "$toDouble": "$product_quantity" } } } },
      { $sort: { 'count': -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product_details",
        }
      },
      { $unwind: "$product_details" },
      {
        $lookup: {
          from: "images",
          localField: "product_details.img",
          foreignField: "_id",
          as: "product_details.image",
        }
      }
    ]).exec((err, data) => {
      if (err) {
        return cb(err)
      }
      cb(null, data || [])
    });
  }

  static getSalesTotal(user_id, type, cb){
    Order.aggregate([
      { $match: { created_by: { $eq: new ObjectID(user_id) } } },
      {
        $redact: {
          $cond: [
            {
              $and: [
                type == 'month' && { $eq: [{ $month: "$created_at" }, new Date().getMonth() + 1] },
                { $eq: [{ $year: "$created_at" }, new Date().getFullYear()] }
              ].filter(Boolean)
            },
            "$$KEEP",
            "$$PRUNE"
          ]
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product_details",
        }
      },
      { $unwind: "$product_details" },
      { $set: { productPrice: "$product_details.price" } },
      { $project: { product_details: 0 } },
      {
        $project: {
          product_quantity: 1, productPrice: 1, total: { $multiply: [{ "$toDouble": "$product_quantity" }, { "$toDouble": "$productPrice" }] }
        }
      },
      { $group: { _id: null, total_sales: { $sum: "$total" } } }
    ]).exec((err, data) => {
      if (err) {
        return cb(err)
      }
      if (data.length){
        cb(null, data[0].total_sales  || 0)
      }else{
        cb(null, 0)
      }
    });
  }

  static getInvoiceCount(user_id,cb){
    Order.estimatedDocumentCount({created_by: ObjectID(user_id)})
      .exec((err, data) => {
        if (err) {return cb(err)}
        cb(null, data || 0);
      });

  }
}

export default OrderDal
