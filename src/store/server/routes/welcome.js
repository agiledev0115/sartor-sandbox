import express from "express"
import WebAppController from "../controllers/webapp"
import WebAppControllerN from "../controllers/webappN"
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../../../../config/auth"

const router = express.Router()

router.get("/", forwardAuthenticated, (req, res) =>
  res.render("login", { url: req.originalUrl })
)
router.get("/signup", WebAppController.signup)
router.get("/dashboard", ensureAuthenticated, WebAppController.DashBoard)
router.get("/forgot_password", WebAppController.ForgotPassword)
router.get("/chat", ensureAuthenticated, WebAppController.chat)
router.get("/bankdetails", ensureAuthenticated, WebAppController.BankDetail)
router.post("/bankdetails/add", ensureAuthenticated, WebAppController.AddBankDetail)
router.get("/analytics", ensureAuthenticated, WebAppController.Analytics)
router.get("/curtin", ensureAuthenticated, WebAppController.Curtin)
router.get("/comingsoon", ensureAuthenticated, WebAppController.ComingSoon)
// router.get('/customerdetail', ensureAuthenticated, WebAppController.showCustomer);
router.get("/invoice/:id", ensureAuthenticated, WebAppController.Invoice)
router.post(
  "/invoice/update",
  ensureAuthenticated,
  WebAppController.updateInvoice
)
router.get("/customerdata", ensureAuthenticated, WebAppController.CustomerData)
router.get(
  "/customerdata/add",
  ensureAuthenticated,
  WebAppController.AddCustomerForm
)
router.post(
  "/notifi/read",
  ensureAuthenticated,
  WebAppControllerN.readNotification
)
router.post(
  "/message/read",
  ensureAuthenticated,
  WebAppControllerN.readMessages
)
router.post("/send/like", ensureAuthenticated, WebAppControllerN.sendLike)
router.post("/remove/like", ensureAuthenticated, WebAppControllerN.removeLike)
router.get("/order/add", ensureAuthenticated, WebAppController.AddOrderForm)
router.post("/order/add", ensureAuthenticated, WebAppController.AddOrder)
router.post("/order/delete", ensureAuthenticated, WebAppController.DeleteOrder)
router.get(
  "/customerdata/edit/:id",
  ensureAuthenticated,
  WebAppController.EditCustomerForm
)
router.post("/addcustomer", ensureAuthenticated, WebAppController.AddCustomer)
router.post(
  "/customerdata/edit",
  ensureAuthenticated,
  WebAppController.EditCustomer
)
router.post(
  "/customerdata/delete",
  ensureAuthenticated,
  WebAppController.DeleteCustomer
)
router.get(
  "/customerdatainfo/:id",
  ensureAuthenticated,
  WebAppController.CustomerdataInfo
)
router.get(
  "/customerdatainfo/addtag/:id",
  ensureAuthenticated,
  WebAppController.CustomerDataInfoAddTagForm
)
router.post(
  "/customerdatainfo/addtag",
  ensureAuthenticated,
  WebAppController.CustomerDataInfoAddTag
)
router.get("/order", ensureAuthenticated, WebAppController.Order)
router.get("/payout", ensureAuthenticated, WebAppController.Payout)
router.get("/overview", ensureAuthenticated, WebAppController.Overview)
router.get("/profile", ensureAuthenticated, WebAppController.PersonalProfile)
router.get("/category", ensureAuthenticated, WebAppController.category)
router.get("/brands", ensureAuthenticated, WebAppController.brands)
router.get("/product", ensureAuthenticated, WebAppController.allProducts)
router.get("/products", ensureAuthenticated, WebAppController.products)
router.get("/blog", ensureAuthenticated, WebAppControllerN.blog)
router.get("/blogedit/:id", ensureAuthenticated, WebAppControllerN.blogEdit)
router.get("/notification", ensureAuthenticated, WebAppControllerN.notification)
router.get("/customers", ensureAuthenticated, WebAppControllerN.customers)
router.get("/internal", ensureAuthenticated, WebAppControllerN.internalUsers)
router.get("/chat", ensureAuthenticated, WebAppControllerN.chat)
router.get("/showcase", ensureAuthenticated, WebAppController.showcase)
router.get("/showcase/edit", ensureAuthenticated, WebAppController.showcaseEdit)
router.post("/showcase/update", ensureAuthenticated, WebAppController.showcaseUpdate)
router.get("/showcase/editdetail", ensureAuthenticated, WebAppController.showcaseEditDetail)
router.post("/showcase/udpatestoredetail", ensureAuthenticated, WebAppController.showcaseUpdateDetail)
router.post("/app/showcase/add", ensureAuthenticated, WebAppController.showcaseCreate)
router.get("/app/showcase", ensureAuthenticated, WebAppController.showcaseGet)
router.post("/app/showcase/like", WebAppController.showcaseLike)
router.post("/app/showcase/comment", WebAppController.showcaseComment)

router.post("/app/addfollower", ensureAuthenticated, WebAppController.addfollower)
router.get("/app/getfollowers", ensureAuthenticated, WebAppController.getFollwers)
router.get("/app/getsuggested", ensureAuthenticated, WebAppController.getSuggested)
router.get("/app/getfollowings", ensureAuthenticated, WebAppController.getFollowings)


router.get(
  "/app/remove_video",
  ensureAuthenticated,
  WebAppController.removeVideos
)
router.get("/app/logout", WebAppController.logout)
router.post("/app/authenticate", WebAppController.authentication)
router.post("/app/register", WebAppController.registeration)
router.post("/app/showCase", WebAppController.uploadShowCase)
router.post("/app/remove_images", WebAppController.removeShowCaseImages)
router.post(
  "/app/category",
  ensureAuthenticated,
  WebAppController.createCategory
)
router.post(
  "/app/category/remove",
  ensureAuthenticated,
  WebAppController.removeCategory
)
router.post("/app/brands", ensureAuthenticated, WebAppController.createBrand)
router.post(
  "/app/brands/remove",
  ensureAuthenticated,
  WebAppController.removeBrands
)
router.post(
  "/app/brands/top",
  ensureAuthenticated,
  WebAppControllerN.updateTopBrand
)
router.post(
  "/app/change_password",
  ensureAuthenticated,
  WebAppController.changePassword
)
router.post(
  "/app/change_profile",
  ensureAuthenticated,
  WebAppController.changeProfile
)
router.post(
  "/app/descriptionVideo",
  ensureAuthenticated,
  WebAppController.uploadedVideo
)
router.post(
  "/app/uploadProfile",
  ensureAuthenticated,
  WebAppController.uploadPicture
)
router.post("/app/products", ensureAuthenticated, WebAppController.addProducts)
router.post(
  "/app/products/remove",
  ensureAuthenticated,
  WebAppController.removeProducts
)
router.get(
  "/app/product/:id",
  ensureAuthenticated,
  WebAppControllerN.viewProducts
)
router.post(
  "/readnotification",
  ensureAuthenticated,
  WebAppControllerN.readNotification
)
router.post(
  "/app/product/update",
  ensureAuthenticated,
  WebAppControllerN.updateTheProduct
)
router.post(
  "/app/review/remove",
  ensureAuthenticated,
  WebAppControllerN.removeReview
)
router.post("/app/blog", ensureAuthenticated, WebAppControllerN.createBlog)
router.post(
  "/app/blog/update",
  ensureAuthenticated,
  WebAppControllerN.updateBlog
)
router.post(
  "/app/notification",
  ensureAuthenticated,
  WebAppControllerN.createNotification
)
router.post(
  "/app/notification/remove",
  ensureAuthenticated,
  WebAppControllerN.removeNotification
)
router.post(
  "/app/blog/remove",
  ensureAuthenticated,
  WebAppControllerN.removeBlog
)
router.post("/blogdetail", ensureAuthenticated, WebAppControllerN.blogDetail)
router.post(
  "/app/customers/remove",
  ensureAuthenticated,
  WebAppControllerN.removeCustomers
)
router.post(
  "/app/chat",
  ensureAuthenticated,
  WebAppControllerN.chatwithCustomer
)
// router.post('/customerdetail', ensureAuthenticated, WebAppControllerN.CustomerDetail);
router.post(
  "/detailupdate",
  ensureAuthenticated,
  WebAppControllerN.updateProduct
)
router.post(
  "/detaildelete",
  ensureAuthenticated,
  WebAppControllerN.deleteProduct
)
// router.post("/search", ensureAuthenticated, WebAppControllerN.searchSartar)
router.get("/search", ensureAuthenticated, WebAppController.SearchOrder)
router.get("/search/:id", ensureAuthenticated, WebAppController.GetOrder)
router.post("/checkouts", ensureAuthenticated, WebAppControllerN.getCheckouts)

export default router
