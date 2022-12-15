import express from "express"
import ProductsRoute from "./routes/products"
import ProductCategoriesRoute from "./routes/productCategories"
import SitemapRoute from "./routes/sitemap"
import ThemeRoute from "./routes/theme"
import CustomersRoute from "./routes/customers"
import CustomerGroupsRoute from "./routes/customerGroups"
import OrdersRoute from "./routes/orders"
import OrderStatusesRoute from "./routes/orderStatuses"
import ShippingMethodsRoute from "./routes/shippingMethods"
import PaymentMethodsRoute from "./routes/paymentMethods"
import PaymentGatewaysRoute from "./routes/paymentGateways"
import SettingsRoute from "./routes/settings"
import PagesRoute from "./routes/pages"
import SecurityTokensRoute from "./routes/tokens"
import NotificationsRoute from "./routes/notifications"
import RedirectsRoute from "./routes/redirects"
import FilesRoute from "./routes/files"
import AppsRoute from "./routes/apps"
import WebhooksRoute from "./routes/webhooks"

const apiRouter = express.Router()

apiRouter.use("/", ProductsRoute)
apiRouter.use("/", ProductCategoriesRoute)
apiRouter.use("/", SitemapRoute)
apiRouter.use("/", ThemeRoute)
apiRouter.use("/", CustomersRoute)
apiRouter.use("/", CustomerGroupsRoute)
apiRouter.use("/", OrdersRoute)
apiRouter.use("/", OrderStatusesRoute)
apiRouter.use("/", ShippingMethodsRoute)
apiRouter.use("/", PaymentMethodsRoute)
apiRouter.use("/", PaymentGatewaysRoute)
apiRouter.use("/", SettingsRoute)
apiRouter.use("/", PagesRoute)
apiRouter.use("/", SecurityTokensRoute)
apiRouter.use("/", NotificationsRoute)
apiRouter.use("/", RedirectsRoute)
apiRouter.use("/", FilesRoute)
apiRouter.use("/", AppsRoute)
apiRouter.use("/", WebhooksRoute)

export default apiRouter
