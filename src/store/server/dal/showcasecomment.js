import ShowCaseComment from "../models/showcasecomment"
import Brands from "../models/brands"
import { ObjectID } from "mongodb"
import moment from "moment"


const population = [
  {
    path: "created_by",
    model: Brands,
    select: "_id name img"
  }
]

class ShowCaseCommentDal {
  constructor() {}

  static async createSync(data){
    try {
      const now = moment().toISOString()
      data["created_at"] = now
      const ShowCaseCommentModel = new ShowCaseComment(data)
      let res = await ShowCaseCommentModel.save()
      let comment = await ShowCaseComment.findOne({ _id: res.id }).populate(
        population
      )
      return comment
    } catch (error) {
        throw Error(error)
    }
  }

  static async getRecentShowCaseComments(showcase, limit){
    try {
      let count = await ShowCaseComment.find({
        showcase: new ObjectID(showcase),
      }).countDocuments()
      let skip = count - limit > 0 ? count - limit : 0
      let comments = await ShowCaseComment.find({
        showcase: new ObjectID(showcase),
      })
        .populate(population)
        .skip(skip)
      return { comments: comments , count: count}
    } catch (error) {
      throw Error(error);
    }
  }

  static async fetchShowCaseComments(showcases){
    try {
      let showcasewithcomments = [];
      for (let showcase of showcases){
        let comments = await ShowCaseCommentDal.getRecentShowCaseComments(
          showcase._id,
          15
        )
        showcase.comments = comments;
        showcasewithcomments.push(showcase);
      }
      return showcasewithcomments
    } catch (error) {
      return showcases;
    }
  }


}

export default ShowCaseCommentDal