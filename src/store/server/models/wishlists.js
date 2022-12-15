import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const WishListSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Products" },
    customer: { type: Schema.Types.ObjectId, ref: "Customers" },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

WishListSchema.plugin(paginator)

export default mongoose.model("Wishlists", WishListSchema)
