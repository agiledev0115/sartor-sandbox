import security from "../lib/security"
import SecurityTokensService from "../services/security/tokens"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/security/tokens",
    security.checkUserScope.bind(this, security.scope.ADMIN),
    getTokens.bind(this)
  )
  .get(
    "/v1/security/tokens/blacklist",
    security.checkUserScope.bind(this, security.scope.ADMIN),
    getTokensBlacklist.bind(this)
  )
  .post(
    "/v1/security/tokens",
    security.checkUserScope.bind(this, security.scope.ADMIN),
    addToken.bind(this)
  )
  .get(
    "/v1/security/tokens/:id",
    security.checkUserScope.bind(this, security.scope.ADMIN),
    getSingleToken.bind(this)
  )
  .put(
    "/v1/security/tokens/:id",
    security.checkUserScope.bind(this, security.scope.ADMIN),
    updateToken.bind(this)
  )
  .delete(
    "/v1/security/tokens/:id",
    security.checkUserScope.bind(this, security.scope.ADMIN),
    deleteToken.bind(this)
  )
  .post("/v1/authorize", sendDashboardSigninUrl.bind(this))

function getTokens(req, res, next) {
  SecurityTokensService.getTokens(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getTokensBlacklist(req, res, next) {
  SecurityTokensService.getTokensBlacklist()
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleToken(req, res, next) {
  SecurityTokensService.getSingleToken(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addToken(req, res, next) {
  SecurityTokensService.addToken(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateToken(req, res, next) {
  SecurityTokensService.updateToken(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteToken(req, res, next) {
  SecurityTokensService.deleteToken(req.params.id)
    .then(data => {
      res.end()
    })
    .catch(next)
}

function sendDashboardSigninUrl(req, res, next) {
  SecurityTokensService.sendDashboardSigninUrl(req)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

export default router
