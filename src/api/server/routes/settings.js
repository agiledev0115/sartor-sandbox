import security from "../lib/security"
import SettingsService from "../services/settings/settings"
import EmailSettingsService from "../services/settings/email"
import ImportSettingsService from "../services/settings/import"
import CommerceSettingsService from "../services/settings/commerce"
import EmailTemplatesService from "../services/settings/emailTemplates"
import CheckoutFieldsService from "../services/settings/checkoutFields"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/settings",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getSettings.bind(this)
  )
  .put(
    "/v1/settings",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateSettings.bind(this)
  )
  .get(
    "/v1/settings/email",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getEmailSettings.bind(this)
  )
  .put(
    "/v1/settings/email",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateEmailSettings.bind(this)
  )
  .get(
    "/v1/settings/import",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getImportSettings.bind(this)
  )
  .put(
    "/v1/settings/import",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateImportSettings.bind(this)
  )
  .get(
    "/v1/settings/commerceform",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    retrieveCommerceSettings.bind(this)
  )
  .put(
    "/v1/settings/commerceform",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateCommerceSettings.bind(this)
  )
  .get(
    "/v1/settings/email/templates/:name",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getEmailTemplate.bind(this)
  )
  .put(
    "/v1/settings/email/templates/:name",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateEmailTemplate.bind(this)
  )
  .get(
    "/v1/settings/checkout/fields",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getCheckoutFields.bind(this)
  )
  .get(
    "/v1/settings/checkout/fields/:name",
    security.checkUserScope.bind(this, security.scope.READ_SETTINGS),
    getCheckoutField.bind(this)
  )
  .put(
    "/v1/settings/checkout/fields/:name",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    updateCheckoutField.bind(this)
  )
  .post(
    "/v1/settings/logo",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    uploadLogo.bind(this)
  )
  .delete(
    "/v1/settings/logo",
    security.checkUserScope.bind(this, security.scope.WRITE_SETTINGS),
    deleteLogo.bind(this)
  )

function getSettings(req, res, next) {
  SettingsService.getSettings()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateSettings(req, res, next) {
  SettingsService.updateSettings(req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function getEmailSettings(req, res, next) {
  EmailSettingsService.getEmailSettings()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateEmailSettings(req, res, next) {
  EmailSettingsService.updateEmailSettings(req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function getImportSettings(req, res, next) {
  ImportSettingsService.getImportSettings()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateImportSettings(req, res, next) {
  ImportSettingsService.updateImportSettings(req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function retrieveCommerceSettings(req, res, next) {
  CommerceSettingsService.retrieveCommerceSettings()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateCommerceSettings(req, res, next) {
  CommerceSettingsService.updateCommerceSettings(req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function getEmailTemplate(req, res, next) {
  EmailTemplatesService.getEmailTemplate(req.params.name)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateEmailTemplate(req, res, next) {
  EmailTemplatesService.updateEmailTemplate(req.params.name, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function getCheckoutFields(req, res, next) {
  CheckoutFieldsService.getCheckoutFields()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getCheckoutField(req, res, next) {
  CheckoutFieldsService.getCheckoutField(req.params.name)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateCheckoutField(req, res, next) {
  CheckoutFieldsService.updateCheckoutField(req.params.name, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function uploadLogo(req, res, next) {
  SettingsService.uploadLogo(req, res, next)
}

function deleteLogo(req, res, next) {
  SettingsService.deleteLogo().then(() => {
    res.end()
  })
}

export default router
