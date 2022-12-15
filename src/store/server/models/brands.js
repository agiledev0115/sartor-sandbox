import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const BrandSchema = new Schema(
  {
    show_case_video_title: { type: String },
    show_case_video: { type: String },
    privacy_policy: { type: String },
    about: { type: String },
    refund_policy: { type: String },
    shiping_policy: { type: String },
    terms_of_services: { type: String },
    title: { type: String },
    img: { type: String },
    banner: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: "Customers" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Customers" }],
    is_top: { type: Boolean, default: false },
    created_at: { type: Date, default: new Date() },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

BrandSchema.plugin(paginator)

export default mongoose.model("Brands", BrandSchema)
