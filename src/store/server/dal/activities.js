import moment from "moment"
import Activities from "../models/activities"

const population = [
  {
    path: "created_by",
    model: Activities,
    select: "_id created_at activity_type activity_detail",
  },
]

class ActivitiesDal {
  constructor() {}

  static get(query, cb) {
    // const ActivitiesModal = new Activities(ActivitiesData)
    Activities.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }
        cb(null, doc || {})
      })
  }

  static create(ActivitiesData, cb) {
    const ActivitiesModal = new Activities(ActivitiesData)
    
    ActivitiesModal.save(function SaveActivity(err, data) {
      if (err) {
        return cb(err)
      }

      ActivitiesDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  // static delete(query, cb) {
  //   TimeLine.findOne(query)
  //     .populate(population)
  //     .exec(function deleteOrder(err, doc) {
  //       if (err) {
  //         return cb(err)
  //       }

  //       if (!doc) {
  //         return cb(null, {})
  //       }

  //       TimeLine.remove(query, err => {
  //         if (err) {
  //           return cb(err)
  //         }

  //         cb(null, doc)
  //       })
  //     })
  // }

  // static update(query, updates, cb) {
  //   const now = moment().toISOString()

  //   TimeLine.findOneAndUpdate(query, updates, {}).exec((err, cust) => {
  //     if (err) {
  //       return cb(err)
  //     }
  //     cb(null, cust || {})
  //   })
  // }

  static getCollection(query, qs, cb) {
    Activities.find(query, {}, qs)
      .sort({ _id: -1 })
      .populate(population)
      .exec(function getOrderCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default ActivitiesDal
