import moment from "moment"
import Message from "../models/messages"
import Brands from "../models/brands"
import Customer from "../models/customers"
import Internal from "../models/internal"

const population = [
  {
    path: "salers",
    model: Internal,
  },
  {
    path: "brands",
    model: Brands,
  },
  {
    path: "customer",
    model: Customer,
  },
  {
    path: "reply",
    model: Customer,
  },
  {
    path: "created_by",
    select: "-password",
  },
]

class MessagesDal {
  constructor() {}

  static get(query, cb) {
    Message.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(MessageData, cb) {
    const MessageModel = new Message(MessageData)

    MessageModel.save(function saveMessage(err, data) {
      if (err) {
        return cb(err)
      }

      MessagesDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Message.findOne(query)
      .populate(population)
      .exec(function deleteMessage(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Message.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const now = moment().toISOString()
    const opts = {
      new: true,
    }

    Message.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateMessage(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static updateBulk(query, updates, cb){
    Message.updateMany(query, updates)
      .exec(function updateMessage(err, doc) {
        if (err) {
          return cb(err)
        }
        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Message.find(query, {}, opt)
      .populate(population)
      .exec(function getMessagesCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }

  static async getMessages(query, opt) {
    try {
      const messages = await Message.find(query, {}, opt).populate(population)
      return messages
    } catch (error) {
      return Error(error)
    }
  }

}

export default MessagesDal
