import "core-js/stable"
import React from "react"
import { Provider } from "react-redux"
import "regenerator-runtime/runtime"
import "../../../public/admin-assets/css/flexboxgrid.min.css"
import "../../../public/admin-assets/css/style.css"
import { apiWebSoket, auth, settings } from "./lib"
import { fetchSettings } from "./modules/settings/actions"
import Router from "./router"
import store from "./store"

const { connectToWebSocket } = apiWebSoket
const developerMode = settings.developerMode === true
if (developerMode === false) {
  auth.validateCurrentToken()
}

store.dispatch(fetchSettings())

if (window.WebSocket) {
  connectToWebSocket(store)
} else {
  console.info("WebSocket is not supported by your browser.")
}

const App = () => (
  <Provider store={store}>
    <React.StrictMode>
      <Router />
    </React.StrictMode>
  </Provider>
)

export default App
