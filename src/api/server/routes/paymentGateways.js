import security from "../lib/security"
import PaymentGatewaysService from "../services/settings/paymentGateways"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/payment_gateways/:name",
    security.checkUserScope.bind(this, security.scope.READ_PAYMENT_METHODS),
    getGateway.bind(this)
  )
  .put(
    "/v1/payment_gateways/:name",
    security.checkUserScope.bind(this, security.scope.WRITE_PAYMENT_METHODS),
    updateGateway.bind(this)
  )

function getGateway(req, res, next) {
  PaymentGatewaysService.getGateway(req.params.name)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateGateway(req, res, next) {
  PaymentGatewaysService.updateGateway(req.params.name, req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

export default router
