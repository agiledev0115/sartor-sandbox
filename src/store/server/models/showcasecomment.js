import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const ShowCaseCommentSchema = new Schema(
  {
    showcase: { type: Schema.Types.ObjectId, ref: "ShowCase" },
    created_by: { type: Schema.Types.ObjectId, ref: "Brands" },
    comment: {type: String},
    created_at: { type: Date, default: new Date() },
  },
  { versionKey: false }
)

ShowCaseCommentSchema.plugin(paginator)

export default mongoose.model("ShowCaseComment", ShowCaseCommentSchema)
