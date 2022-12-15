import moment from "moment"
import Image from "../models/images"

const population = [
  {
    path: "created_by",
    select: "-password",
  },
]

class ImagesDal {
  constructor() {}

  static get(query, cb) {
    Image.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(ImageData, cb) {
    const ImageModel = new Image(ImageData)

    ImageModel.save(function saveImage(err, data) {
      if (err) {
        return cb(err)
      }

      ImagesDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Image.findOne(query)
      .populate(population)
      .exec(function deleteImage(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Image.remove(query, err => {
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

    Image.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateImage(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Image.find(query, {}, opt)
      .populate(population)
      .exec(function getImagesCollection(err, doc) {
        if (err) {
          return cb(err)
        }

        return cb(null, doc)
      })
  }
}

export default ImagesDal
