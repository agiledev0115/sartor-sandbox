import express from "express"
import MessagesController from "../controllers/messages"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get(
  "/",
  AuthController.accessControl(["super_admin"]),
  MessagesController.fetchAll
)
router.get(
  "/lists",
  AuthController.accessControl(["customers"]),
  MessagesController.showlists
)
router.get(
  "/unread",
  AuthController.accessControl(["customers"]),
  MessagesController.unreadMessages
)
router.get("/:id", MessagesController.fetchOne)
router.post(
  "/",
  AuthController.accessControl(["customers", "salers"]),
  MessagesController.create
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  MessagesController.update
)
router.param("id", MessagesController.validateMessage)
router.delete(
  "/:id",
  AuthController.accessControl(["customers"]),
  MessagesController.delete
)

export default router
