import express from "express"
import SalesController from "../controllers/sales"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["admin", "super_admin"]),
  SalesController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  SalesController.showlists
)
router.get("/:id", SalesController.fetchOne)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  SalesController.update
)
router.param("id", SalesController.validateSales)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  SalesController.delete
)

export default router
