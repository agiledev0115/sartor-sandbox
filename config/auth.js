function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash("error_msg", "Wrong Credential")
  res.redirect("/")
}

function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next()
  }
  res.redirect("/dashboard")
}

export { ensureAuthenticated, forwardAuthenticated }
