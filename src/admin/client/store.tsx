import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import { reducer as formReducer } from "redux-form"
import apps from "./modules/apps/reducer"
import customerGroups from "./modules/customerGroups/reducer"
import customers from "./modules/customers/reducer"
import files from "./modules/files/reducer"
import orders from "./modules/orders/reducer"
import orderStatuses from "./modules/orderStatuses/reducer"
import pages from "./modules/pages/reducer"
import productCategories from "./modules/productCategories/reducer"
import products from "./modules/products/reducer"
import settings from "./modules/settings/reducer"

const reducer = combineReducers({
  // here we will be adding reducers
  form: formReducer,
  productCategories,
  products,
  settings,
  customerGroups,
  customers,
  orders,
  orderStatuses,
  pages,
  apps,
  files,
})

const store = configureStore({
  reducer,
})

export default store
