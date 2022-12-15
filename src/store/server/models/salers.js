import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const SalersSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    picture: { type: String, default: "uploads/default_profile.png" },
    full_name: { type: String },
    email: { type: String },
    phone: { type: String },
    city: { type: String },
    address: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date, default: null },
    preference: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

SalersSchema.plugin(paginator)

export default mongoose.model("Salers", SalersSchema)
