import security from "../lib/security"
import AppSettingsService from "../services/apps/settings"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/apps/:key/settings",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getSettings.bind(this)
  )
  .put(
    "/v1/apps/:key/settings",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateSettings.bind(this)
  )

function getSettings(req, res, next) {
  AppSettingsService.getSettings(req.params.key)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateSettings(req, res, next) {
  AppSettingsService.updateSettings(req.params.key, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

export default router
