import express from "express"
import WishListsController from "../controllers/wishlists"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["super_admin"]),
  WishListsController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  WishListsController.showlists
)
router.get("/:id", WishListsController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["customers"]),
  WishListsController.create
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  WishListsController.update
)
router.param("id", WishListsController.validateWishList)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  WishListsController.delete
)

export default router
