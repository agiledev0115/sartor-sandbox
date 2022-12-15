import moment from "moment"
import User from "../models/user"
import Customer from "../models/customers"
import Brand from "../models/brands"

const returnFields = User.whitelist

const population = [
  {
    path: "internal",
    populate: [
      {
        path: "brands",
        model: Brand,
      },
    ],
  },
  {
    path: "customers",
    model: Customer,
  },
  {
    path: "salers",
  },
  {
    path: "user",
    select: "-password",
  },
  {
    path: "created_by",
    select: "-password",
  },
]

class UserDal {
  constructor() {}

  static create(userData, cb) {
    const searchQuery = { username: userData.username }

    // Make sure user does not exist.
    User.findOne(searchQuery, function userExists(err, isPresent) {
      if (err) {
        return cb(err)
      }

      if (isPresent) {
        return cb(new Error("User already exists"))
      }

      // Create user if is new.
      const userModel = new User(userData)

      userModel.save(function saveUser(err, data) {
        if (err) {
          return cb(err)
        }

        UserDal.get({ _id: data._id }, (err, user) => {
          if (err) {
            return cb(err)
          }

          cb(null, user)
        })
      })
    })
  }

  static delete(query, cb) {
    User.findOne(query, returnFields)
      .populate(population)
      .exec(function deleteUser(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(null, {})
        }

        user.remove(err => {
          if (err) {
            return cb(err)
          }

          cb(null, user)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()
    const opts = {
      new: true,
      safe: true,
      upsert: true,
      select: returnFields,
    }

    User.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateUser(err, user) {
        if (err) {
          return cb(err)
        }

        cb(null, user || {})
      })
  }

  static get(query, cb) {
    User.findOne(query)
      .populate(population)
      .exec((err, user) => {
        if (err) {
          return cb(err)
        }

        cb(null, user || {})
      })
  }

  static getCollection(query, qs, cb) {
    User.find(query, {}, qs)
      .populate(population)
      .exec((err, user) => {
        if (err) {
          return cb(err)
        }

        cb(null, user || {})
      })
  }
  static async getUser(user_id){
    try {
      let user = await User.findOne({ _id: user_id }).populate(population)
      return user;
    } catch (error) {
      return Error(error);
    }
  }
}

export default UserDal
