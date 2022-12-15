import express from "express"
import InternalController from "../controllers/internal"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/", InternalController.getInternals)
router.get(
  "/:id",
  AuthController.accessControl([
    "admin",
    "data_encoder",
    "dispatcher",
    "finance",
    "super_admin",
  ]),
  InternalController.getInternal
)
router.post(
  "/",
  AuthController.accessControl(["admin"]),
  InternalController.createInternal
)
router.param("id", InternalController.validateInternal)
router.put(
  "/profilePic",
  AuthController.accessControl(["*"]),
  InternalController.uploadProfile
)
router.put(
  "/:id",
  AuthController.accessControl(["admin"]),
  InternalController.updateInternal
)
router.delete(
  "/:id",
  AuthController.accessControl(["admin"]),
  InternalController.deleteInternal
)

export default router
