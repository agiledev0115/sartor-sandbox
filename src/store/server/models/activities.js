import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const ActivitiesSchema = new Schema(
  {
    activity_type: {type: String},
    activity_detail: {type: String},
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

ActivitiesSchema.plugin(paginator)

export default mongoose.model("Activities", ActivitiesSchema)
