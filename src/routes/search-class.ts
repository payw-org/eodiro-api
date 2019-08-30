import express from 'express'
import FilterController from 'Http/controllers/search-class/FilterController'
import RequestValidationError from 'Http/middleware/RequestValidationError'

const router = express.Router({ mergeParams: true })

/**
 * Controller
 */
// get filter list and default value
router.get('/filter', FilterController.get())

// partial update to the filter value
router.patch(
  '/filter',
  FilterController.validateUpdate(),
  RequestValidationError.handler(),
  FilterController.update()
)

export default router
