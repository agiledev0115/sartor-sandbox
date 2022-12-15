import security from "../lib/security"
import CategoriesService from "../services/products/productCategories"
import { Router } from "express"

const router = Router()

router
  .get(
    "/v1/product_categories",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCT_CATEGORIES),
    getCategories.bind(this)
  )
  .post(
    "/v1/product_categories",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES),
    addCategory.bind(this)
  )
  .get(
    "/v1/product_categories/:id",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCT_CATEGORIES),
    getSingleCategory.bind(this)
  )
  .put(
    "/v1/product_categories/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES),
    updateCategory.bind(this)
  )
  .delete(
    "/v1/product_categories/:id",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES),
    deleteCategory.bind(this)
  )
  .post(
    "/v1/product_categories/:id/image",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES),
    uploadCategoryImage.bind(this)
  )
  .delete(
    "/v1/product_categories/:id/image",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES),
    deleteCategoryImage.bind(this)
  )

function getCategories(req, res, next) {
  CategoriesService.getCategories(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleCategory(req, res, next) {
  CategoriesService.getSingleCategory(req.params.id)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addCategory(req, res, next) {
  CategoriesService.addCategory(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateCategory(req, res, next) {
  CategoriesService.updateCategory(req.params.id, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteCategory(req, res, next) {
  CategoriesService.deleteCategory(req.params.id)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

function uploadCategoryImage(req, res, next) {
  CategoriesService.uploadCategoryImage(req, res, next)
}

function deleteCategoryImage(req, res, next) {
  CategoriesService.deleteCategoryImage(req.params.id)
  res.end()
}

export default router
