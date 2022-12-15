import ShowCaseLike from "../models/showcaselike"
import Brands from "../models/brands"
import { ObjectID } from "mongodb"
import moment from "moment"

const population = [
  {
    path: "created_by",
    model: Brands,
    select: "_id name img",
  },
]

class ShowCaseLikeDal {
  constructor() {}

  static async createSync(data,val) {
    try {
      const now = moment().toISOString()
      if(val == 0){
        data["created_at"] = now
        const ShowCaseLikeModel = new ShowCaseLike(data)
        let res = await ShowCaseLikeModel.save()
        let like = await ShowCaseLike.findOne({ _id: res.id }).populate(population)
        return like
      }else{
        let res = await ShowCaseLike.findOneAndDelete(data)
        console.log(res);
        return true;
      }
    } catch (error) {
      throw Error(error)
    }
  }

  static async getRecentShowCaseLikes(showcase, limit) {
    try {
      let count = await ShowCaseLike.find({
        showcase: new ObjectID(showcase),
      }).countDocuments()
      let skip = count - limit > 0 ? count - limit : 0
      let likes = await ShowCaseLike.find({
        showcase: new ObjectID(showcase),
      })
        .populate(population)
        .skip(skip)
      return { likes: likes, count: count }
    } catch (error) {
      throw Error(error)
    }
  }

  static async isLikedByBrand(showcase, brand){
    try {
      let count = await ShowCaseLike.find({
        showcase: showcase,
        created_by: brand,
      }).countDocuments()
      return count > 0 ? true : false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  static async fetchShowCaseLikes(brand, showcases) {
    try {
      let showcasewithLikes = []
      for (let showcase of showcases) {
        let likes = await ShowCaseLikeDal.getRecentShowCaseLikes(
          showcase._id,
          5
        )
        let is_liked = await ShowCaseLikeDal.isLikedByBrand(showcase._id, brand)
        showcase.likes = likes
        showcase.likes["liked"] = is_liked
        showcasewithLikes.push(showcase)
      }
      return showcasewithLikes
    } catch (error) {
      console.log(error)
      return showcases
    }
  }
}

export default ShowCaseLikeDal
