import express from 'express'
import RequestValidationError from 'Http/middleware/RequestValidationError'
import SearchController from 'Http/controllers/search-class/SearchController'

const router = express.Router({ mergeParams: true })

/**
 * Controller
 */
// get filter and default class list
router.get(
  '/',
  SearchController.validateGet(),
  RequestValidationError.handler(),
  SearchController.get()
)

// partial update filter or search word
router.patch(
  '/',
  SearchController.validateUpdate(),
  RequestValidationError.handler(),
  SearchController.update()
)

export default router
