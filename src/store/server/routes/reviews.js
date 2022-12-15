import express from "express"
import ReviewsController from "../controllers/reviews"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["super_admin", "admin"]),
  ReviewsController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  ReviewsController.showlists
)
router.get("/:id", ReviewsController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["customers"]),
  ReviewsController.create
)
router.post("/search", ReviewsController.searchReview)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  ReviewsController.update
)
router.param("id", ReviewsController.validateReviews)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  ReviewsController.delete
)

export default router
