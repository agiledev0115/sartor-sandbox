import mongoose from "mongoose"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const CategorySchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    archived: { type: Boolean, default: false },
    archived_at: { type: Date, default: null },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: null },
  },
  { versionKey: false }
)

CategorySchema.plugin(paginator)

export default mongoose.model("Category", CategorySchema)
