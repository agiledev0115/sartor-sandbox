import BrandInfo from "../models/bankdetails"

const population = [
  {
    path: "created_by",
    select: "-password",
  },
]

class BankDetailDal {
  constructor() { }

  static get(query, cb) {
    BrandInfo.findOne(query)
      .populate(population)
      .exec((err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc || {})
      })
  }

  static create(BankData, cb) {
    const BrandInfoModel = new BrandInfo(BankData)

    BrandInfoModel.save(function SaveBankDetail(err, data) {
      if (err) {
        return cb(err)
      }

      BankDetailDal.get({ _id: data._id }, (err, doc) => {
        if (err) {
          return cb(err)
        }

        cb(null, doc)
      })
    })
  }
}

export default BankDetailDal
