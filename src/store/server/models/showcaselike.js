import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const ShowCaseLikeSchema = new Schema(
  {
    showcase: { type: Schema.Types.ObjectId, ref: "ShowCase" },
    created_by: { type: Schema.Types.ObjectId, ref: "Brands" },
    created_at: { type: Date, default: new Date() },
  },
  { versionKey: false }
)

ShowCaseLikeSchema.plugin(paginator)

export default mongoose.model("ShowCaseLike", ShowCaseLikeSchema)
