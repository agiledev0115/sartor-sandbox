import LocalStrategy from "passport-local"
import bcrypt from "bcryptjs"
import User from "../src/store/server/models/user"

function passportMiddleware(passport) {
  passport.use(
    new LocalStrategy.Strategy(
      { usernameField: "username" },
      (username, password, done) => {
        // Match user
        User.findOne({
          username,
        }).then(user => {
          if (!user) {
            return done(null, false, {
              message: "This email is not registered",
            })
          }
          switch (user.role) {
            case "customers":
              return done(null, false, { message: "Access Denied!" })
            default:
              // Match password
              bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err
                if (isMatch) {
                  return done(null, user)
                } else {
                  return done(null, false, { message: "Password incorrect" })
                }
              })
          }
        })
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}

export default passportMiddleware
