import mongoose from "mongoose"
import moment from "moment"

const Schema = mongoose.Schema

const TokenSchema = new Schema({
  value: { type: String },
  revoked: { type: Boolean, default: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  date_created: { type: Date },
  last_modified: { type: Date },
})

function preSaveMiddleware(next) {
  const token = this
  const now = moment.toISOString()

  token.date_created = now
  token.last_modified = now

  next()
}

const tokenWhitelist = {
  _id: 1,
  value: 1,
  revoked: 1,
  user: 1,
  date_created: 1,
}

TokenSchema.pre("save", preSaveMiddleware)
TokenSchema.statics.whitelist = tokenWhitelist

export default mongoose.model("Token", TokenSchema)
