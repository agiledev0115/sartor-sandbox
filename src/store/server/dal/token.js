import Token from "../models/token"
import mongoUpdate from "../lib/mongo-update"

const returnFields = Token.whitelist
const population = [
  {
    path: "user",
    select: "-password",
  },
]

class TokenDal {
  constructor() {}

  static get(query, cb) {
    Token.findOne(query, returnFields)
      .populate(population)
      .exec(function getToken(err, token) {
        if (err) {
          return cb(err)
        }

        cb(null, token || {})
      })
  }

  static create(tokenData, cb) {
    const query = { user: tokenData.user }

    Token.findOne(query, function tokenExists(err, isPresent) {
      if (err) {
        return cb(err)
      }

      if (isPresent) {
        TokenDal.get({ _id: isPresent._id }, (err, token) => {
          if (err) {
            return cb(err)
          }

          cb(null, token)
        })
        return
      }

      // Create token if is new.
      const tokenModel = new Token(tokenData)

      tokenModel.save(function saveToken(err, data) {
        if (err) {
          return cb(err)
        }

        TokenDal.get({ _id: data._id }, err => {
          if (err) {
            return cb(err)
          }

          cb(null, data)
        })
      })
    })
  }

  static deleteItem(query, cb) {
    const opts = {}
    Token.findOne(query, opts)
      .populate(population)
      .exec(function deleteToken(err, token) {
        if (err) {
          return cb(err)
        }

        if (!token) {
          return cb(null, {})
        }

        token.remove(err => {
          if (err) {
            return cb(err)
          }

          cb(null, token)
        })
      })
  }

  static update(query, updates, cb) {
    // const now = moment().toISOString()
    const opts = {
      new: true,
      select: returnFields,
    }

    updates = mongoUpdate(updates)

    Token.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateToken(err, token) {
        if (err) {
          return cb(err)
        }

        cb(null, token || {})
      })
  }

  static getCollection(query, qs, cb) {
    cb(
      null,
      Token.find(query, returnFields)
        .populate(population)
        .stream({ transform: JSON.stringify })
    )
  }
}

export default TokenDal
