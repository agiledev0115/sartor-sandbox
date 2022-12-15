import express from "express"
import helmet from "helmet"
import responseTime from "response-time"
import path from "path"
import cookieParser from "cookie-parser"
import winston from "winston"
import settings from "../../../config/server"
import robotsRendering from "./robotsRendering"
import sitemapRendering from "./sitemapRendering"
import redirects from "./redirects"
import pageRendering from "./pageRendering"

// Sartor Imports

import passportMiddleware from "../../../config/passport"
import expressEjsLayouts from "express-ejs-layouts"
// import authorize from "./lib/authorize"
import { OPEN_ENDPOINTS, initRoutes } from "./api"
import validator from "express-validator"
import session from "express-session"
import multipart from "./lib/multipart"
import flash from "connect-flash"
import passport from "passport"
import multer from "multer"
import logger from "./lib/logger"
import Utils from "./lib"
import mongoose from "mongoose"
import cors from "cors"

const app = express()

passportMiddleware(passport)

// Connect to mongoDB.
;(async () => {
  try {
    await mongoose.connect(settings.MONGODB.URL, settings.MONGODB.OPTS)
    winston.info("MongoDB - Store - Sartor connected successfully")
  } catch (error) {
    winston.error(
      `MongoDB - Store - Sartor connection was failed. ${error.message}`
    )
    return
  }
})()

// MongoDB error handler.

mongoose.connection.on("error", Utils.mongoErrorHandler)

// MongoDB Disconnection handler.

mongoose.connection.on(
  "disconnected",
  async function handleMongodbDisconnection() {
    await mongoose.connect(settings.MONGODB.URL, settings.MONGODB.OPTS)
  }
)

// Service Settings

app.disable("x-powered-by")

// PRODUCTION Environment settings

if (settings.NODE_ENV === "production") {
  app.enable("trust proxy", 1)
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, settings.MEDIA.UPLOADES)
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage })
app.use(upload.any())

app.all("*", (req, res, next) => {
  // CORS headers
  res.header("Access-Control-Allow-Origin")
  res.header("Access-Control-Allow-Methods", "GET,POST")
  res.header("Access-Control-Allow-Credentials", "true")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Key, Authorization"
  )
  next()
})

// Documentation resource

app.use("/media", express.static(path.join(__dirname, "media")))
app.use(express.static(`${process.cwd()}/public/sartor`))
app.use("/css", express.static(`${process.cwd()}/public/sartor/css`))
app.use("/js", express.static(`${process.cwd()}/public/sartor/js`))
app.use("/fonts", express.static(`${process.cwd()}/public/sartor/fonts`))
app.use("/images", express.static(`${process.cwd()}/public/sartor/images`))
app.use(
  "/fullcalendar",
  express.static(`${process.cwd()}/public/sartor/fullcalendar`)
)
app.use("/partials", express.static(`${process.cwd()}/theme/views/partials`))
app.use("/public/uploads", express.static(`${process.cwd()}/public/uploads`))
app.use(cors(settings.CORS_OPTS))
// app.use(authorize().unless({ path: OPEN_ENDPOINTS }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(
  multipart({
    limits: {
      files: 1,
      fileSize: settings.MEDIA.FILE_SIZE,
    },
    immediate: true,
  })
)
app.use(validator())

// EJS

app.use(expressEjsLayouts)
app.set("view engine", "ejs")
app.set("views", `${process.cwd()}/src/store/shared/views`)

// Express session

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
)

// Passport middleware

app.use(passport.initialize())
app.use(passport.session())

// Connect flash

app.use(flash())

// Global variables

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  next()
})

// Init routes

initRoutes(app)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Resource Requested Not Found")
  err.status = 404
  next(err)
})

// Error handlers.

// Development error handler will print stacktrace

if (settings.ENV === "development") {
  app.use((err, req, res, next) => {
    const status = err.status || 500
    res.status(status).json({
      error: {
        status,
        type: err.name,
        message: err.message,
      },
      raw: err,
    })
  })
}

// Production error handler no stacktraces leaked to user

app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({
    error: {
      status,
      type: err.name,
      message: err.message,
    },
  })
})

// Cezerin3 Store Server config

const adminIndexPath = path.resolve("public/admin/index.html")
const staticOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 365, // One year
}

app.use(helmet({ contentSecurityPolicy: false }))
app.get("/images/:entity/:id/:size/:filename", (req, res, next) => {
  // A stub of image resizing (can be done with Nginx)
  const newUrl = `/images/${req.params.entity}/${req.params.id}/${req.params.filename}`
  req.url = newUrl
  next()
})
app.use(express.static("public/content", staticOptions))
app.use("/assets", express.static("theme/assets", staticOptions))
app.use("/admin-assets", express.static("public/admin-assets", staticOptions))
app.use("/sw.js", express.static("theme/assets/sw.js"))
app.use("/admin", (req, res) => {
  res.sendFile(adminIndexPath)
})
app.get(
  /^.+\.(jpg|jpeg|gif|png|bmp|ico|webp|svg|css|js|zip|rar|flv|swf|xls)$/,
  (req, res) => {
    // Send 404 image
    res.sendFile(path.resolve("public/content/404.svg"))
  }
)
app.get("/robots.txt", robotsRendering)
app.get("/sitemap.xml", sitemapRendering)
app.get("*", redirects)
app.use(responseTime())
app.use(cookieParser(settings.cookieSecretKey))
app.get("*", pageRendering)

const server = app.listen(settings.storeListenPort, () => {
  const serverAddress = server.address()
  winston.info(
    `Store - Sartor running at http://localhost:${serverAddress.port}`
  )
})
