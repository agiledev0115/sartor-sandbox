import express from "express"
import FavoriteController from "../controllers/favorite"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["super_admin"]),
  FavoriteController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  FavoriteController.showlists
)
router.get("/:id", FavoriteController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["customers"]),
  FavoriteController.create
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  FavoriteController.update
)
router.param("id", FavoriteController.validateFavorite)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  FavoriteController.delete
)

export default router
