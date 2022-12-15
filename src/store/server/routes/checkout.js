import express from "express"
import CheckoutController from "../controllers/checkout"
import AuthController from "../controllers/auth"
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../../../../config/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["admin", "super_admin"]),
  CheckoutController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  CheckoutController.showlists
)
router.get("/:id", CheckoutController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["customers"]),
  CheckoutController.create
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  CheckoutController.update
)
router.param("id", CheckoutController.validateCheckout)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  CheckoutController.delete
)

export default router
