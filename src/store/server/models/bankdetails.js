import { Email } from "@material-ui/icons"
import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const BankDetailsSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    birthDay: { type: Date },
    emailId: { type: String },
    pcno: { type: String },
    ssn: { type: String },
    businessType: { type: String },
    companyName: { type: String },
    bcno: { type: String },
    EIN: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    panno: { type: String },
    accno: { type: String },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

BankDetailsSchema.plugin(paginator)

export default mongoose.model("brandinfo", BankDetailsSchema)
