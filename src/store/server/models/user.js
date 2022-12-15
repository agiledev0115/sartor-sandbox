import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import moment from "moment"
import config from "../../../../config/server"
import paginator from "mongoose-paginate"

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    internal: { type: mongoose.Schema.Types.ObjectId, ref: "Internal" },
    customers: { type: mongoose.Schema.Types.ObjectId, ref: "Customers" },
    salers: { type: mongoose.Schema.Types.ObjectId, ref: "Salers" },
    username: { type: String },
    password: { type: String },
    email: { type: String },
    is_registered: { type: Boolean, default: false },
    last_login: { type: Date },
    role: { type: String },
    status: { type: String, default: "active" },
    corporate_activation_status: { type: Boolean, default: false },
    created_at: { type: Date },
    updated_at: { type: Date },
    archived: { type: Boolean, default: false },
    archived_at: { type: Date, default: null },
    reset_password_token: { type: String },
    reset_password_expires: { type: Date },
    password_changed: { type: Boolean },
  },
  { versionKey: false }
)

UserSchema.plugin(paginator)

UserSchema.pre("save", function preSaveHook(next) {
  const model = this

  bcrypt.genSalt(config.SALT_LENGTH, function genSalt(err, salt) {
    if (err) {
      return next(err)
    }

    bcrypt.hash(model.password, salt, function hashPasswd(err, hash) {
      if (err) {
        return next(err)
      }
      const now = moment().toISOString()
      model.password = hash
      model.date_created = now
      model.last_modified = now

      next()
    })
  })
})

// Compare Passwords Method
UserSchema.methods.checkPassword = function checkPassword(password, cb) {
  bcrypt.compare(password, this.password, function done(err, res) {
    if (err) {
      return cb(err)
    }

    cb(null, res)

    console.log(res)
  })
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
