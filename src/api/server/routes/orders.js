import security from "../lib/security"
import OrdersService from "../services/orders/orders"
import OrderAddressService from "../services/orders/orderAddress"
import OrderItemsService from "../services/orders/orderItems"
import OrdertTansactionsService from "../services/orders/orderTransactions"
import OrdertDiscountsService from "../services/orders/orderDiscounts"
import SettingsService from "../services/settings/settings"
import PaymentGateways from "../paymentGateways"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/orders",
    security.checkUserScope.bind(this, security.scope.READ_ORDERS),
    getOrders.bind(this)
  )
  .post(
    "/v1/orders",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    addOrder.bind(this)
  )
  .get(
    "/v1/orders/:id",
    security.checkUserScope.bind(this, security.scope.READ_ORDERS),
    getSingleOrder.bind(this)
  )
  .put(
    "/v1/orders/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    updateOrder.bind(this)
  )
  .delete(
    "/v1/orders/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    deleteOrder.bind(this)
  )

  .put(
    "/v1/orders/:id/recalculate",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    recalculateOrder.bind(this)
  )
  .put(
    "/v1/orders/:id/checkout",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    checkoutOrder.bind(this)
  )
  .put(
    "/v1/orders/:id/cancel",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    cancelOrder.bind(this)
  )
  .put(
    "/v1/orders/:id/close",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    closeOrder.bind(this)
  )

  .put(
    "/v1/orders/:id/billing_address",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    updateBillingAddress.bind(this)
  )
  .put(
    "/v1/orders/:id/shipping_address",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    updateShippingAddress.bind(this)
  )

  .post(
    "/v1/orders/:id/items",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    addItem.bind(this)
  )
  .put(
    "/v1/orders/:id/items/:item_id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    updateItem.bind(this)
  )
  .delete(
    "/v1/orders/:id/items/:item_id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    deleteItem.bind(this)
  )

  .post(
    "/v1/orders/:id/transactions",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    addTransaction.bind(this)
  )
  .put(
    "/v1/orders/:id/transactions/:transaction_id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    updateTransaction.bind(this)
  )
  .delete(
    "/v1/orders/:id/transactions/:transaction_id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    deleteTransaction.bind(this)
  )

  .post(
    "/v1/orders/:id/discounts",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    addDiscount.bind(this)
  )
  .put(
    "/v1/orders/:id/discounts/:discount_id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    updateDiscount.bind(this)
  )
  .delete(
    "/v1/orders/:id/discounts/:discount_id",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    deleteDiscount.bind(this)
  )

  .get(
    "/v1/orders/:id/payment_form_settings",
    security.checkUserScope.bind(this, security.scope.READ_ORDERS),
    getPaymentFormSettings.bind(this)
  )

  .post(
    "/v1/orders/:id/charge",
    security.checkUserScope.bind(this, security.scope.WRITE_ORDERS),
    chargeOrder.bind(this)
  )

function getOrders(req, res, next) {
  OrdersService.getOrders(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleOrder(req, res, next) {
  OrdersService.getSingleOrder(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addOrder(req, res, next) {
  OrdersService.addOrder(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateOrder(req, res, next) {
  OrdersService.updateOrder(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteOrder(req, res, next) {
  OrdersService.deleteOrder(req.params.id)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

function recalculateOrder(req, res, next) {
  OrderItemsService.calculateAndUpdateAllItems(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function checkoutOrder(req, res, next) {
  OrdersService.checkoutOrder(req.params.id)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function cancelOrder(req, res, next) {
  OrdersService.cancelOrder(req.params.id)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function closeOrder(req, res, next) {
  OrdersService.closeOrder(req.params.id)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateBillingAddress(req, res, next) {
  OrderAddressService.updateBillingAddress(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function updateShippingAddress(req, res, next) {
  OrderAddressService.updateShippingAddress(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addItem(req, res, next) {
  const order_id = req.params.id
  OrderItemsService.addItem(order_id, req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateItem(req, res, next) {
  const order_id = req.params.id
  const item_id = req.params.item_id
  OrderItemsService.updateItem(order_id, item_id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteItem(req, res, next) {
  const order_id = req.params.id
  const item_id = req.params.item_id
  OrderItemsService.deleteItem(order_id, item_id)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function addTransaction(req, res, next) {
  const order_id = req.params.id
  OrdertTansactionsService.addTransaction(order_id, req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateTransaction(req, res, next) {
  const order_id = req.params.id
  const transaction_id = req.params.item_id
  OrdertTansactionsService.updateTransaction(order_id, transaction_id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteTransaction(req, res, next) {
  const order_id = req.params.id
  const transaction_id = req.params.item_id
  OrdertTansactionsService.deleteTransaction(order_id, transaction_id)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function addDiscount(req, res, next) {
  const order_id = req.params.id
  OrdertDiscountsService.addDiscount(order_id, req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateDiscount(req, res, next) {
  const order_id = req.params.id
  const discount_id = req.params.item_id
  OrdertDiscountsService.updateDiscount(order_id, discount_id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteDiscount(req, res, next) {
  const order_id = req.params.id
  const discount_id = req.params.item_id
  OrdertDiscountsService.deleteDiscount(order_id, discount_id)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getPaymentFormSettings(req, res, next) {
  const orderId = req.params.id
  PaymentGateways.getPaymentFormSettings(orderId)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

async function chargeOrder(req, res, next) {
  const orderId = req.params.id
  try {
    const isSuccess = await OrdersService.chargeOrder(orderId)
    res.status(isSuccess ? 200 : 500).end()
  } catch (err) {
    next(err)
  }
}

export default router
