import moment from "moment"
import Brands from "../models/brands"
import {ObjectID} from "mongodb"

const population = [
  {
    path: "created_by",
    select: "-password",
  },
]

class BrandDal {
  constructor() {}

  static get(query, cb) {
    Brands.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }
        cb(null, doc || {})
      })
  }

  static create(BrandsData, cb) {
    const BrandsModel = new Brands(BrandsData)

    BrandsModel.save(function saveBrands(err, data) {
      if (err) {
        return cb(err)
      }

      BrandDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }
        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    Brands.findOne(query)
      .populate(population)
      .exec(function deleteBrands(err, doc) {
        if (err) {
          return cb(err)
        }

        if (!doc) {
          return cb(null, {})
        }

        Brands.remove(query, err => {
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

    Brands.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateBrands(err, doc) {
        if (err) {
          return cb(err)
        }
        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    Brands.find(query, {}, opt)
      .sort({ title: 1 })
      .populate(population)
      .exec(function getBrandssCollection(err, doc) {
        if (err) {
          return cb(err)
        }
        return cb(null, doc)
      })
  }
  static async getFollowedBrands(brand){
    try {
      let brands = await Brands.find(
        {
          followers: {
            $elemMatch: { $eq: new ObjectID(brand) },
          },
        },
        { _id: 1 }
      )
      if(brands){
        let brandIDs = []
        for(let br of brands){
          brandIDs.push(br._id)
        }
        return brandIDs
      }else{
        return []
      }
    } catch (error) {
      console.log(error)
      return []
    }
  }
  static getPaginatedResults(query, page,limit,cb){
    let options = {
      sort: { created_at: -1 },
      populate: [
        {path: "created_by", select: "_id name"},
        {
        path: "brand",
        model: Brands,
        select: "_id img title"
      }],
      lean: true,
      page: parseInt(page),
      limit: parseInt(limit)
    };


    Brands.paginate(query, options, function getFollowersCollection(
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

export default BrandDal
