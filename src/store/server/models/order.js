import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const OrderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customers" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    product_quantity: { type: String },
    // Customer picture
    // picture: { type: String, default: "uploads/default_profile.png" },
    // Customer full name
    order_id: {
      type: String,
      default: () => {
        return (Math.floor(Math.random() * 90030000) + 10000000).toString()
      },
    },
    message: { type: String },
    status: { type: String },
    shipping_address: { type: String },
    billing_address: { type: String },
    
    // new field
    meta_discription: { type: String },
    sku: { type: String },
    stock: { type: Number },
    weight: { type: String },
    product_color: { type: String },
    preorder: { type: String },
    allow_backorder: { type: String },
    discontunied: { type: String },

    // Customer Body measurement
    tracking_n: { type: String, default: "" },
    note: { type: String },
    timeline: { type: Schema.Types.ObjectId, ref: "Timeline" },
    created_at: { type: Date, default: new Date() }, // Order Date
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    notify: {type: Boolean, default: true},
  },
  { versionKey: false }
)

OrderSchema.plugin(paginator)

export default mongoose.model("Order", OrderSchema)
