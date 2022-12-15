import security from "../lib/security"
import PagesService from "../services/pages/pages"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/pages",
    security.checkUserScope.bind(this, security.scope.READ_PAGES),
    getPages.bind(this)
  )
  .post(
    "/v1/pages",
    security.checkUserScope.bind(this, security.scope.WRITE_PAGES),
    addPage.bind(this)
  )
  .get(
    "/v1/pages/:id",
    security.checkUserScope.bind(this, security.scope.READ_PAGES),
    getSinglePage.bind(this)
  )
  .put(
    "/v1/pages/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_PAGES),
    updatePage.bind(this)
  )
  .delete(
    "/v1/pages/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_PAGES),
    deletePage.bind(this)
  )

function getPages(req, res, next) {
  PagesService.getPages(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSinglePage(req, res, next) {
  PagesService.getSinglePage(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addPage(req, res, next) {
  PagesService.addPage(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updatePage(req, res, next) {
  PagesService.updatePage(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deletePage(req, res, next) {
  PagesService.deletePage(req.params.id)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

export default router
