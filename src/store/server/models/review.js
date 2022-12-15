import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Products" },
    customer: { type: Schema.Types.ObjectId, ref: "Customers" },
    img: { type: String },
    review: { type: String },
    rate: { type: Number },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "Customers" },
  },
  { versionKey: false }
)

ReviewSchema.plugin(paginator)

export default mongoose.model("Reviews", ReviewSchema)
