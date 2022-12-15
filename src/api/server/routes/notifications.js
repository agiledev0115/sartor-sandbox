import PaymentGateways from "../paymentGateways"
import { Router } from "express"

const router = Router()

router.post("/v1/notifications/:gateway", paymentNotification.bind(this))

function paymentNotification(req, res, next) {
  PaymentGateways.paymentNotification(req, res, req.params.gateway)
}

export default router
