import security from "../lib/security"
import ThemeService from "../services/theme/theme"
import ThemeSettingsService from "../services/theme/settings"
import ThemeAssetsService from "../services/theme/assets"
import ThemePlaceholdersService from "../services/theme/placeholders"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/theme/export",
    security.checkUserScope.bind(this, security.scope.READ_THEME),
    exportTheme.bind(this)
  )
  .post(
    "/v1/theme/install",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    installTheme.bind(this)
  )

  .get(
    "/v1/theme/settings",
    security.checkUserScope.bind(this, security.scope.READ_THEME),
    getSettings.bind(this)
  )
  .put(
    "/v1/theme/settings",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    updateSettings.bind(this)
  )
  .get(
    "/v1/theme/settings_schema",
    security.checkUserScope.bind(this, security.scope.READ_THEME),
    getSettingsSchema.bind(this)
  )

  .post(
    "/v1/theme/assets",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    uploadFile.bind(this)
  )
  .delete(
    "/v1/theme/assets/:file",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    deleteFile.bind(this)
  )

  .get(
    "/v1/theme/placeholders",
    security.checkUserScope.bind(this, security.scope.READ_THEME),
    getPlaceholders.bind(this)
  )
  .post(
    "/v1/theme/placeholders",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    addPlaceholder.bind(this)
  )
  .get(
    "/v1/theme/placeholders/:key",
    security.checkUserScope.bind(this, security.scope.READ_THEME),
    getSinglePlaceholder.bind(this)
  )
  .put(
    "/v1/theme/placeholders/:key",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    updatePlaceholder.bind(this)
  )
  .delete(
    "/v1/theme/placeholders/:key",
    security.checkUserScope.bind(this, security.scope.WRITE_THEME),
    deletePlaceholder.bind(this)
  )

function exportTheme(req, res, next) {
  ThemeService.exportTheme(req, res)
}

function installTheme(req, res, next) {
  ThemeService.installTheme(req, res)
}

function getSettings(req, res, next) {
  ThemeSettingsService.getSettings()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateSettings(req, res, next) {
  ThemeSettingsService.updateSettings(req.body)
    .then(() => {
      res.end()
    })
    .catch(next)
}

function getSettingsSchema(req, res, next) {
  ThemeSettingsService.getSettingsSchema()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function uploadFile(req, res, next) {
  ThemeAssetsService.uploadFile(req, res, next)
}

function deleteFile(req, res, next) {
  ThemeAssetsService.deleteFile(req.params.file)
    .then(() => {
      res.end()
    })
    .catch(next)
}

function getPlaceholders(req, res, next) {
  ThemePlaceholdersService.getPlaceholders()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSinglePlaceholder(req, res, next) {
  ThemePlaceholdersService.getSinglePlaceholder(req.params.key)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addPlaceholder(req, res, next) {
  ThemePlaceholdersService.addPlaceholder(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updatePlaceholder(req, res, next) {
  ThemePlaceholdersService.updatePlaceholder(req.params.key, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deletePlaceholder(req, res, next) {
  ThemePlaceholdersService.deletePlaceholder(req.params.key)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

export default router
