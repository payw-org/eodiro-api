import express from 'express'
import LocaleMiddleware from 'Http/middleware/Locale'
import CheckVendorMiddleware from 'Http/middleware/CheckVendor'
import CampusesController from 'Http/controllers/CampusesController'
import vacantRouter from 'Routes/vacant'
import inquiryRouter from 'Routes/inquiry'
import searchClassRouter from 'Routes/./search-class'
import mealRouter from 'Routes/meal'
import RequestValidationError from 'Http/middleware/RequestValidationError'

const router = express.Router()

/**
 * Middleware
 */
router.use(
  '/campuses/:vendor',
  CheckVendorMiddleware.validate(),
  RequestValidationError.handler(),
  CheckVendorMiddleware.handler()
)

/**
 * Sub router
 */
router.use('/campuses/:vendor/vacant', vacantRouter)
router.use('/campuses/:vendor/inquiry', inquiryRouter)
router.use('/campuses/:vendor/search-class', searchClassRouter)
router.use('/campuses/:vendor/meal', mealRouter)

/**
 * Controller
 */
// show campus list
router.get(
  '/campuses',
  LocaleMiddleware.validate(),
  RequestValidationError.handler(),
  LocaleMiddleware.handler(),
  CampusesController.index()
)

export default router
