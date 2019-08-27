import express from 'express'
import FilterController from 'Http/controllers/search-class/FilterController'

const router = express.Router({ mergeParams: true })

/**
 * Controller
 */
// Get filter list and default value.
router.get('/filter', FilterController.get())

export default router
