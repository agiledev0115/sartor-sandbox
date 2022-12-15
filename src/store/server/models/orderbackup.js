import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const OrderBackupScheme = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "Customers" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    product_quantity: { type: String },
    // Customer picture
    // picture: { type: String, default: "uploads/default_profile.png" },
    // Customer full name
    order_id: { type: String },
    message: { type: String },
    status: { type: String },
    shipping_address: { type: String },
    // Customer Body measurement
    tracking_n: { type: String },
    created_at: { type: String }, // Order Date
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

OrderBackupScheme.plugin(paginator)

export default mongoose.model("OrderBackup", OrderBackupScheme)
