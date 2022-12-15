import express from "express"
import BrandsController from "../controllers/brand"
import AuthController from "../controllers/auth"

const router = express.Router()

router.get("/", BrandsController.fetchAll)
router.get("/top", BrandsController.topBrands)
router.get("/products/:id", BrandsController.products)
router.get("/sales/:id", BrandsController.sales)
router.get(
  "/follow/:id",
  AuthController.accessControl(["customers"]),
  BrandsController.follow
)
router.get(
  "/likes/:id",
  AuthController.accessControl(["customers"]),
  BrandsController.likes
)
router.get("/:id", BrandsController.fetchOne)
router.get(
  "/messages/:id",
  AuthController.accessControl(["customers", "salers"]),
  BrandsController.message
)
router.get(
  "/chats/:id",
  AuthController.accessControl(["customers"]),
  BrandsController.customerMessage
)
router.post(
  "/",
  AuthController.accessControl(["super_admin", "salers"]),
  BrandsController.create
)
router.post(
  "/search",
  AuthController.accessControl(["super_admin", "customers"]),
  BrandsController.searchBrands
)
router.put(
  "/:id",
  AuthController.accessControl(["admin", "super_admin"]),
  BrandsController.update
)
router.param("id", BrandsController.validateBrands)
router.delete(
  "/:id",
  AuthController.accessControl(["super_admin"]),
  BrandsController.delete
)

export default router
