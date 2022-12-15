import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const MessageSchema = new Schema(
  {
    salers: { type: Schema.Types.ObjectId, ref: "Internal" },
    brands: { type: Schema.Types.ObjectId, ref: "Brands" },
    customer: { type: Schema.Types.ObjectId, ref: "Customers" },
    reply: { type: Schema.Types.ObjectId, ref: "Messages", default: null },
    message: { type: String },
    is_read: { type: Boolean, default: false },
    is_readCustomer: { type: Boolean, default: false },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

MessageSchema.plugin(paginator)

export default mongoose.model("Messages", MessageSchema)
