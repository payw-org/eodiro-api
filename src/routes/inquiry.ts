import express from 'express'
import InquiriesController from 'Http/controllers/inquiry/InquiriesController'

const router = express.Router()

/**
 * Controller
 */
// Create a new inquiry.
router.post(
  '/',
  InquiriesController.validateCreate(),
  InquiriesController.create()
)

export default router
