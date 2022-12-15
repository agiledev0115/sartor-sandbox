import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const ShowCaseSchema = new Schema(
  {
    img: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    description: {type: String},
    media: {type: Array, default:[] },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

ShowCaseSchema.plugin(paginator)

export default mongoose.model("ShowCase", ShowCaseSchema)
