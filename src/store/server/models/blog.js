import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const BlogSchema = new Schema(
  {
    title: { type: String },
    story: { type: String },
    image: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    created_at: { type: Date, default: new Date() },
  },
  { versionKey: false }
)

BlogSchema.plugin(paginator)

export default mongoose.model("Blog", BlogSchema)
