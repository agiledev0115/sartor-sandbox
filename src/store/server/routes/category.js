import express from "express"
import CategoryController from "../controllers/category"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/", CategoryController.fetchAll)
router.get("/:id", CategoryController.fetchOne)
router.post(
  "/create",
  AuthController.accessControl(["admin", "super_admin"]),
  CategoryController.create
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  CategoryController.update
)
router.param("id", CategoryController.validateCategory)
router.delete(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  CategoryController.deleteCategory
)

export default router
