import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const TimelineSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    action_message: { type: String },
    action_description: { type: String },
    product_name: { type: String },
    product_description: { type: String },
    created_at: { type: Date, default: new Date() },
  },
  { versionKey: false }
)

TimelineSchema.plugin(paginator)

export default mongoose.model("Timeline", TimelineSchema)
