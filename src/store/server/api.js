import { Router } from "express"
import jwt from "jsonwebtoken"
import CezerinClient from "cezerin2-client"
import serverSettings from "./settings"

// Sartor Imports

import pkg from "../../../package.json"
import settings from "../../../config/server"
import WelcomeRouter from "./routes/welcome"
import UserRouter from "./routes/user"
import InternalRouter from "./routes/internal"
import CategoryRouter from "./routes/category"
import ImageRouter from "./routes/images"
import FavoriteRouter from "./routes/favorite"
import CartsRouter from "./routes/carts"
import WishListsRouter from "./routes/wishlists"
import ReviewRouter from "./routes/reviews"
import BrandRouter from "./routes/brands"
import CheckoutRouter from "./routes/checkout"
import MessageRouter from "./routes/messages"
import SalersRouter from "./routes/salers"
import SalesRouter from "./routes/sales"
import BlogRouter from "./routes/blog"

const router = Router()

const TOKEN_PAYLOAD = { email: "store", scopes: ["admin"] }
const STORE_ACCESS_TOKEN = jwt.sign(TOKEN_PAYLOAD, serverSettings.jwtSecretKey)

const api = new CezerinClient({
  apiBaseUrl: serverSettings.apiBaseUrl,
  ajaxBaseUrl: serverSettings.ajaxBaseUrl,
  apiToken: STORE_ACCESS_TOKEN,
})

// Sartor Routes

function initRoutes(app) {
  app.use("/", WelcomeRouter)
  app.use("/users", UserRouter) // this is for the customers
  app.use("/internals", InternalRouter)
  app.use("/categories", CategoryRouter)
  app.use("/images", ImageRouter)
  app.use("/favorite", FavoriteRouter)
  app.use("/wishlists", WishListsRouter)
  app.use("/carts", CartsRouter)
  app.use("/reviews", ReviewRouter)
  app.use("/brands", BrandRouter)
  app.use("/checkout", CheckoutRouter)
  app.use("/message", MessageRouter)
  app.use("/salers", SalersRouter)
  app.use("/sales", SalesRouter)
  app.use("/blog", BlogRouter)
  app.get("/", (req, res) => {
    res.json({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      documentation: settings.DOCS_URL,
      uptime: `${process.uptime()}s`,
    })
  })
}

const OPEN_ENDPOINTS = [
  /\/media\/.*/,
  /\/documentation\/.*/,
  /\/profilePicByAdmin\/.*/,
  /\/guaranteeDocbyAdmin\/.*/,
  /\/helperIDbyAdmin\/.*/,
  /\/otherDocbyAdmin\/.*/,
  "/api/categories",
  "/api/users/login",
  "/api/users/signup",
  "/api/users/password/forgot_password",
  "/api/users/password/reset",
  "/api/users/activate/account",
  "/api/users/phone_reset_pass",
  "/signup",
  "/dashboard",
  "/forgot_password",
  "/category",
  "/profile",
  "/brands",
  "/bankdetails",
  "/curtin",
  "/comingsoon",
  "/invoice",
  "/order",
  "/overview",
  "/payout",
  "/showcase",
  "/products",
  "/app/authenticate",
  "/app/logout",
  "/app/register",
  "/app/category",
  "/app/brands",
  "/app/blog",
  "/app/category/remove",
  "/app/brands/remove",
  "/app/change_password",
  "/app/change_profile",
  "/app/uploadProfile",
  "/app/products",
  "/app/notification",
  "/app/products/remove",
  "/app/product/view",
  "/app/review/remove",
  "/app/blog/remove",
  "/product",
  "/detail",
  "/detailupdate",
  "/readnotification",
  "/blog",
  "/app/blogdetails",
  "/customers",
  "/app/customers/remove",
  "/chat",
  "/app/chat",
  "/customerdetail",
  "/customerdata",
  "/customerdatainfo",
  "/internal",
  "/app/brands/top",
  "/app/product/update",
  "/search",
  "/checkouts",
  "/notification",
  "/app/notification/remove",
  "/app/showCase",
  "/app/remove_images",
  "/app/remove_video",
  "/app/descriptionVideo",

  "/",
]

export { initRoutes, OPEN_ENDPOINTS }
export default api
