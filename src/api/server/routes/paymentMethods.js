import security from "../lib/security"
import PaymentMethodsService from "../services/orders/paymentMethods"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/payment_methods",
    security.checkUserScope.bind(this, security.scope.READ_PAYMENT_METHODS),
    getMethods.bind(this)
  )
  .post(
    "/v1/payment_methods",
    security.checkUserScope.bind(this, security.scope.WRITE_PAYMENT_METHODS),
    addMethod.bind(this)
  )
  .get(
    "/v1/payment_methods/:id",
    security.checkUserScope.bind(this, security.scope.READ_PAYMENT_METHODS),
    getSingleMethod.bind(this)
  )
  .put(
    "/v1/payment_methods/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_PAYMENT_METHODS),
    updateMethod.bind(this)
  )
  .delete(
    "/v1/payment_methods/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_PAYMENT_METHODS),
    deleteMethod.bind(this)
  )

function getMethods(req, res, next) {
  PaymentMethodsService.getMethods(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleMethod(req, res, next) {
  PaymentMethodsService.getSingleMethod(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addMethod(req, res, next) {
  PaymentMethodsService.addMethod(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateMethod(req, res, next) {
  PaymentMethodsService.updateMethod(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteMethod(req, res, next) {
  PaymentMethodsService.deleteMethod(req.params.id)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

export default router
