import express from "express"
import ImageController from "../controllers/images"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/", ImageController.fetchAll)
router.get("/:id", ImageController.fetchOne)
router.post("/", ImageController.create)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  ImageController.update
)
router.param("id", ImageController.validateImage)
router.delete(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  ImageController.delete
)

export default router
