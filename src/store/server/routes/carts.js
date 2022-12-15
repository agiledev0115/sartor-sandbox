import express from "express"
import CartsController from "../controllers/carts"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["admin", "super_admin"]),
  CartsController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  CartsController.showlists
)
router.get("/:id", CartsController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["customers"]),
  CartsController.create
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  CartsController.update
)
router.param("id", CartsController.validateCarts)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  CartsController.delete
)

export default router
