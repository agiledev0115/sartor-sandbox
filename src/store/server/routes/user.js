import express from "express"
import UserController from "../controllers/user"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/sendma", UserController.sendEmail1)
router.get("/", UserController.getUserInfo)
router.post("/register", UserController.register)
router.post("/login", AuthController.login)
router.get("/logout", AuthController.logout)
router.post(
  "/createAdmin",
  AuthController.accessControl(["super_admin"]),
  UserController.createAdmin
)
router.post("/signup", UserController.createUser)
router.get(
  "/paginate",
  AuthController.accessControl(["admin", "super_admin"]),
  UserController.getByPagination
)
router.param("id", UserController.validateUser)
router.get(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  UserController.getUser
)
router.put(
  "/changeRole",
  AuthController.accessControl(["admin", "super_admin"]),
  UserController.changeRole
)
router.put("/activate/account", UserController.activateCoporateAccount)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  UserController.updateUser
)
router.put("/password/update", UserController.passwordChange)
router.post("/phone_reset_pass", UserController.resetPhonePass)
router.post("/checkPhone", UserController.checkPhone)
router.post("/password/forgot_password", UserController.forgotPassword)
router.post("/password/reset", UserController.resetPassword)

export default router
