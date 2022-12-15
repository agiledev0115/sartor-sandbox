import ShowCase from "../models/brandsShowCase"
import Brands from "../models/brands"
import { ObjectId } from "mongodb"

const population = [
  {
    path: "created_by",
    select: "-password",
  },
  {
    path: "brand",
    model: Brands,
    select: "_id img title"
  }
]

class ShowCaseDal {
  constructor() {}

  static get(query, cb) {
    ShowCase.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(ShowCaseData, cb) {
    const ShowCaseModel = new ShowCase(ShowCaseData)

    ShowCaseModel.save(function saveShowCase(err, data) {
      if (err) {
        return cb(err)
      }

      ShowCaseDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }

  static delete(query, cb) {
    ShowCase.findOne(query)
      .populate(population)
      .exec(function deleteShowCase(err, doc) {
        if (err) {
          return cb(err)
        }
        if (!doc) {
          return cb(null, {})
        }
        ShowCase.remove(query, err => {
          if (err) {
            return cb(err)
          }

          cb(null, doc)
        })
      })
  }

  static update(query, updates, cb) {
    const opts = {
      new: true,
    }

    ShowCase.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec(function updateShowCase(err, doc) {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static getCollection(query, opt, cb) {
    ShowCase.find(query, {}, opt)
      .populate(population)
      .exec(function getShowCasesCollection(err, doc) {
        if (err) {
          return cb(err)
        }
        return cb(null, doc)
      })
  }

  static getMedia(brand, limit, cb){
    let aggs = [
      {$match: {brand: new ObjectId(brand)}},
      { $sort : { created_at : 1 } },
      { $group: { "_id": "$brand", "media": { "$push": "$media" } } },
      { $project: {
            _id: 0,
            created_at: 1,
            media: {
                $reduce: {
                    input: "$media",
                    initialValue: [],
                    in: {
                        $concatArrays: ["$$this", "$$value"]
                    }
                }
            }
        }
      },
      { $unwind: "$media" },
      {$match: {"media.type": "image"}},
    ]
    let images = []
    let count = 0
    ShowCase.aggregate([...aggs, {$limit: limit}])
    .exec(function(err, res) {
      if (err){return cb(err)}
      images = res
      ShowCase.aggregate([...aggs, {$count: "media"}])
      .exec(function(err, res) {
        if (err){return cb(err)}
        count = res.length ? res[0].media : 0
        return cb(null, {images: images, count: count})
      });
    });
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


    ShowCase.paginate(query, options, function getShowCasesCollection(
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

export default ShowCaseDal
