import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const SalesSchema = new Schema(
  {
    products: { type: Schema.Types.ObjectId, ref: "Products" },
    checkouts: { type: Schema.Types.ObjectId, ref: "Checkouts" },
    brands: { type: Schema.Types.ObjectId, ref: "Brands" },
    checkMonth: { type: String },
    checkYear: { type: Number },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

SalesSchema.plugin(paginator)

export default mongoose.model("Sales", SalesSchema)
