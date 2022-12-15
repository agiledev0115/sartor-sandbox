import security from "../lib/security"
import CustomerGroupsService from "../services/customers/customerGroups"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/customer_groups",
    security.checkUserScope.bind(this, security.scope.READ_CUSTOMER_GROUPS),
    getGroups.bind(this)
  )
  .post(
    "/v1/customer_groups",
    security.checkUserScope.bind(this, security.scope.WRITE_CUSTOMER_GROUPS),
    addGroup.bind(this)
  )
  .get(
    "/v1/customer_groups/:id",
    security.checkUserScope.bind(this, security.scope.READ_CUSTOMER_GROUPS),
    getSingleGroup.bind(this)
  )
  .put(
    "/v1/customer_groups/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_CUSTOMER_GROUPS),
    updateGroup.bind(this)
  )
  .delete(
    "/v1/customer_groups/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_CUSTOMER_GROUPS),
    deleteGroup.bind(this)
  )

function getGroups(req, res, next) {
  CustomerGroupsService.getGroups(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleGroup(req, res, next) {
  CustomerGroupsService.getSingleGroup(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addGroup(req, res, next) {
  CustomerGroupsService.addGroup(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateGroup(req, res, next) {
  CustomerGroupsService.updateGroup(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteGroup(req, res, next) {
  CustomerGroupsService.deleteGroup(req.params.id)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

export default router
