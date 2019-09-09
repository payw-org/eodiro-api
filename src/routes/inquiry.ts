import express from 'express'
import InquiriesController from 'Http/controllers/inquiry/InquiriesController'
import RequestValidationError from 'Http/middleware/RequestValidationError'

const router = express.Router({ mergeParams: true })

/**
 * Controller
 */
// Create a new inquiry.
router.post(
  '/',
  InquiriesController.validateCreate(),
  RequestValidationError.handler(),
  InquiriesController.create()
)

export default router
