import express from "express"
import BlogController from "../controllers/blog"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/", BlogController.fetchAll)
router.get("/view", BlogController.view)
router.get("/:id", BlogController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["admin", "super_admin", "salers"]),
  BlogController.create
)
router.post("/search", BlogController.searchBlog)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin", "salers"]),
  BlogController.update
)
router.param("id", BlogController.validateBlog)
router.delete(
  "/:id",
  AuthController.accessControl(["admin", "super_admin", "salers"]),
  BlogController.delete
)

export default router
