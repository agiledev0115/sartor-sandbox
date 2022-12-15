import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const InternalSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    picture: { type: String, default: "images/default_profile.png" },
    brands: { type: Schema.Types.ObjectId, ref: "Brand" },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    descriptions: { type: String },
    videos: { type: String },
    archived_at: { type: Date, default: null },
    created_at: { type: Date },
    updated_at: { type: Date, default: null },
    language_preference: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
)

InternalSchema.plugin(paginator)

export default mongoose.model("Internal", InternalSchema)
