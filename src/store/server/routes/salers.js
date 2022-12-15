import express from "express"
import SalersController from "../controllers/salers"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/", SalersController.fetchAll)
router.get(
  "/profile",
  AuthController.accessControl(["salers"]),
  SalersController.fetchAll
)
router.get("/:id", SalersController.fetchOne)
router.put(
  "/:id",
  AuthController.accessControl(["salers"]),
  SalersController.update
)
router.put(
  "/updateProfile/:id",
  AuthController.accessControl(["salers"]),
  SalersController.updatePicture
)
router.param("id", SalersController.validateSalers)
router.delete(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  SalersController.delete
)

export default router
