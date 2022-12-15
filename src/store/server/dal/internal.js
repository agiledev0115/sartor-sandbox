import moment from "moment"
import Internal from "../models/internal"
import Brand from "../models/brands"

/**
 *  Access Layer for Internal Data.
 * Load Module Dependencies.
 */

const population = [
  {
    path: "brands",
    model: Brand,
  },
  {
    path: "user",
    select: "-password",
  },
]

class InternalDal {
  constructor() {}

  /**
   * Get a Internal.
   *
   * @desc Get a Internal with the given id from db.
   *
   * @param {Object} query Query Object
   * @param {Function} cb Callback for once fetch is complete
   */
  static get(query, cb) {
    Internal.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  /**
   * Create a new Internal.
   *
   * @desc  Creates a new Internal and saves them
   *        in the database.
   *
   * @param {Object}  internalData  Data for the Internal to create
   * @param {Function} cb       Callback for once saving is complete
   */
  static create(internalData, cb) {
    const internalModel = new Internal(internalData)

    internalModel.save(function saveinternal(err, data) {
      if (err) {
        return cb(err)
      }

      InternalDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  /**
   * Delete an Internal.
   *
   * @desc  Delete data of the Internal with the given
   *        id.
   *
   * @param {Object}  query   Query Object
   * @param {Function} cb Callback for once delete is complete
   */
  static delete(query, cb) {
    Internal.findOne(query)
      .populate(population)
      .exec(function deleteinternal(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Internal.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  /**
   * Update a Internal.
   *
   * @desc  Update data of the Internal with the given
   *        id.
   *
   * @param {Object} query Query object
   * @param {Object} updates  Update data
   * @param {Function} cb Callback for once update is complete
   */
  static update(query, updates, cb) {
    const now = moment().toISOString()
    const opts = {
      new: true,
    }

    Internal.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateinternal(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  /**
   * Get a collection of Internal.
   *
   * @desc Get a collection of Internal from db.
   *
   * @param {Object} query Query Object
   * @param {Function} cb Callback for once fetch is complete
   */
  static getCollection(query, opt, cb) {
    Internal.find(query, opt)
      .populate(population)
      .exec(function getinternalsCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }

  /**
   * Get a collection of Internal using pagination.
   *
   * @desc Get a collection of Internal from db.
   *
   * @param {Object} query Query Object
   * @param {Function} cb Callback for once fetch is complete
   */
  static getCollectionByPagination(query, qs, cb) {
    const opts = {
      sortBy: qs.sort || {},
      populate: population,
      page: qs.page,
      limit: qs.limit,
    }

    Internal.paginate(query, opts, (err, docs, page, count) => {
      if (err) {
        return cb(err)
      }
      const data = {
        total_pages: page,
        total_docs_count: count,
        docs,
      }

      cb(null, data)
    })
  }

  static getPaginatedResults(query, page,limit,cb){
    let options = {
      sort: { created_at: -1 },
      populate: [
        {
        path: "brands",
        model: Brand,
      }],
      lean: true,
      page: parseInt(page),
      limit: parseInt(limit)
    };


    Internal.paginate(query, options, function getFollowersCollection(
      err,
      docs
    ) {
      if (err) {
        return cb(err)
      }
      return cb(null, docs)
    })
  }
}

export default InternalDal
