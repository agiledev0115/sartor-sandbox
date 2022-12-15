import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const CheckoutSchema = new Schema(
  {
    billing: { type: String },
    mobile: { type: String },
    // products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    amount: { type: Number },
    additionalMobile: { type: String },
    country: { type: String },
    state: { type: String },
    zipcode: { type: Number },
    cardname: { type: String },
    cardnumber: { type: Number },
    cardExpirmont: { type: Number },
    cardExpirYear: { type: Number },
    checkMonth: { type: String },
    checkYear: { type: Number },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    created_at: { type: Date, default: new Date() },
  },
  { versionKey: false }
)

CheckoutSchema.plugin(paginator)

export default mongoose.model("CheckingOut", CheckoutSchema)
