import { Router } from "express"
import security from "../lib/security"
import ProductImagesService from "../services/products/images"
import ProductOptionsService from "../services/products/options"
import ProductOptionValuesService from "../services/products/optionValues"
import ProductsService from "../services/products/products"
import ProductVariantsService from "../services/products/variants"

const router = Router()

router
  .get(
    "/v1/products",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getProducts.bind(this)
  )
  .post(
    "/v1/products",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    addProduct.bind(this)
  )
  .get(
    "/v1/products/:productId",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getSingleProduct.bind(this)
  )
  .put(
    "/v1/products/:productId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    updateProduct.bind(this)
  )
  .delete(
    "/v1/products/:productId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    deleteProduct.bind(this)
  )

  .get(
    "/v1/products/:productId/images",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getImages.bind(this)
  )
  .post(
    "/v1/products/:productId/images",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    addImage.bind(this)
  )
  .put(
    "/v1/products/:productId/images/:imageId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    updateImage.bind(this)
  )
  .delete(
    "/v1/products/:productId/images/:imageId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    deleteImage.bind(this)
  )

  .get(
    "/v1/products/:productId/sku",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    isSkuExists.bind(this)
  )
  .get(
    "/v1/products/:productId/slug",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    isSlugExists.bind(this)
  )

  .get(
    "/v1/products/:productId/options",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getOptions.bind(this)
  )
  .get(
    "/v1/products/:productId/options/:optionId",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getSingleOption.bind(this)
  )
  .post(
    "/v1/products/:productId/options",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    addOption.bind(this)
  )
  .put(
    "/v1/products/:productId/options/:optionId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    updateOption.bind(this)
  )
  .delete(
    "/v1/products/:productId/options/:optionId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    deleteOption.bind(this)
  )

  .get(
    "/v1/products/:productId/options/:optionId/values",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getOptionValues.bind(this)
  )
  .get(
    "/v1/products/:productId/options/:optionId/values/:valueId",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getSingleOptionValue.bind(this)
  )
  .post(
    "/v1/products/:productId/options/:optionId/values",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    addOptionValue.bind(this)
  )
  .put(
    "/v1/products/:productId/options/:optionId/values/:valueId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    updateOptionValue.bind(this)
  )
  .delete(
    "/v1/products/:productId/options/:optionId/values/:valueId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    deleteOptionValue.bind(this)
  )

  .get(
    "/v1/products/:productId/variants",
    security.checkUserScope.bind(this, security.scope.READ_PRODUCTS),
    getVariants.bind(this)
  )
  .post(
    "/v1/products/:productId/variants",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    addVariant.bind(this)
  )
  .put(
    "/v1/products/:productId/variants/:variantId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    updateVariant.bind(this)
  )
  .delete(
    "/v1/products/:productId/variants/:variantId",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    deleteVariant.bind(this)
  )
  .put(
    "/v1/products/:productId/variants/:variantId/options",
    security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS),
    setVariantOption.bind(this)
  )

function getProducts(req, res, next) {
  ProductsService.getProducts(req.query)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleProduct(req, res, next) {
  ProductsService.getSingleProduct(req.params.productId)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addProduct(req, res, next) {
  ProductsService.addProduct(req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateProduct(req, res, next) {
  ProductsService.updateProduct(req.params.productId, req.body)
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function deleteProduct(req, res, next) {
  ProductsService.deleteProduct(req.params.productId)
    .then(data => {
      res.status(data ? 200 : 404).end()
    })
    .catch(next)
}

function getImages(req, res, next) {
  ProductImagesService.getImages(req.params.productId)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

async function addImage(req, res, next) {
  await ProductImagesService.addImage(req, res, next)
}

function updateImage(req, res, next) {
  ProductImagesService.updateImage(
    req.params.productId,
    req.params.imageId,
    req.body
  ).then(data => {
    res.end()
  })
}

function deleteImage(req, res, next) {
  ProductImagesService.deleteImage(
    req.params.productId,
    req.params.imageId
  ).then(data => {
    res.end()
  })
}

function isSkuExists(req, res, next) {
  ProductsService.isSkuExists(req.query.sku, req.params.productId)
    .then(exists => {
      res.status(exists ? 200 : 404).end()
    })
    .catch(next)
}

function isSlugExists(req, res, next) {
  ProductsService.isSlugExists(req.query.slug, req.params.productId)
    .then(exists => {
      res.status(exists ? 200 : 404).end()
    })
    .catch(next)
}

function getOptions(req, res, next) {
  ProductOptionsService.getOptions(req.params.productId)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleOption(req, res, next) {
  ProductOptionsService.getSingleOption(
    req.params.productId,
    req.params.optionId
  )
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addOption(req, res, next) {
  ProductOptionsService.addOption(req.params.productId, req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateOption(req, res, next) {
  ProductOptionsService.updateOption(
    req.params.productId,
    req.params.optionId,
    req.body
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function deleteOption(req, res, next) {
  ProductOptionsService.deleteOption(req.params.productId, req.params.optionId)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getOptionValues(req, res, next) {
  ProductOptionValuesService.getOptionValues(
    req.params.productId,
    req.params.optionId
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getSingleOptionValue(req, res, next) {
  ProductOptionValuesService.getSingleOptionValue(
    req.params.productId,
    req.params.optionId,
    req.params.valueId
  )
    .then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    })
    .catch(next)
}

function addOptionValue(req, res, next) {
  ProductOptionValuesService.addOptionValue(
    req.params.productId,
    req.params.optionId,
    req.body
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateOptionValue(req, res, next) {
  ProductOptionValuesService.updateOptionValue(
    req.params.productId,
    req.params.optionId,
    req.params.valueId,
    req.body
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function deleteOptionValue(req, res, next) {
  ProductOptionValuesService.deleteOptionValue(
    req.params.productId,
    req.params.optionId,
    req.params.valueId
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function getVariants(req, res, next) {
  ProductVariantsService.getVariants(req.params.productId)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function addVariant(req, res, next) {
  ProductVariantsService.addVariant(req.params.productId, req.body)
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function updateVariant(req, res, next) {
  ProductVariantsService.updateVariant(
    req.params.productId,
    req.params.variantId,
    req.body
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function deleteVariant(req, res, next) {
  ProductVariantsService.deleteVariant(
    req.params.productId,
    req.params.variantId
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

function setVariantOption(req, res, next) {
  ProductVariantsService.setVariantOption(
    req.params.productId,
    req.params.variantId,
    req.body
  )
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

export default router
