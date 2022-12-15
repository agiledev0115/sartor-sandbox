import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const NotifiSchema = new Schema(
  {
    customers: { type: Schema.Types.ObjectId, ref: "Customers" },
    salers: { type: Schema.Types.ObjectId, ref: "Internal" },
    products: { type: Schema.Types.ObjectId, ref: "Product" },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    title: { type: String },
    message: { type: String },
    is_read: { type: Boolean, default: false },
    broadcast: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    archived: { type: Boolean, default: false },
    archived_at: { type: Date, default: null },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null },
  },
  { versionKey: false }
)

NotifiSchema.plugin(paginator)

export default mongoose.model("notification", NotifiSchema)
