import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const CustomerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    picture: { type: String, default: "uploads/default_profile.png" },
    full_name: { type: String },
    favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorites" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reviews" }],
    email: { type: String },
    phone: { type: String },
    city: { type: String },
    tags: { type: [String] },
    country: { type: String },
    address: { type: String },
    gender: { type: String },
    height: { type: String },
    backshoulder: { type: String },
    outerarm: { type: String },
    backneck: { type: String },
    chestgirth: { type: String },
    waistgirth: { type: String },
    hipgirth: { type: String },
    thighgirth: { type: String },
    insideleg: { type: String },
    outsideleg: { type: String },
    frontneck: { type: String },
    backneckpoint: { type: String },
    torsoheight: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date, default: null },
    preference: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

CustomerSchema.plugin(paginator)

export default mongoose.model("Customers", CustomerSchema)
