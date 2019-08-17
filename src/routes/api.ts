import express from 'express'
import LocaleMiddleware from 'Http/middleware/Locale'
import CheckVendorMiddleware from 'Http/middleware/CheckVendor'
import CampusesController from 'Http/controllers/CampusesController'
import vacant_router from 'Routes/vacant'

const router = express.Router()

/**
 * Middleware
 */
router.use('/campuses/:vendor', CheckVendorMiddleware.handler())

/**
 * Sub router
 */
router.use('/campuses/:vendor/vacant', vacant_router)

/**
 * Controller
 */
// show campus list
router.get('/campuses', LocaleMiddleware.handler(), CampusesController.index())

router.get('/test', async (req, res) => {
  res.json({
    result: 'good'
  })
})

export default router
