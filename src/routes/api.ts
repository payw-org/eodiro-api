import express from 'express'
import LocaleMiddleware from 'Http/middleware/Locale'
import CheckVendorMiddleware from 'Http/middleware/CheckVendor'
import CampusesController from 'Http/controllers/CampusesController'
import vacantRouter from 'Routes/vacant'
import emptyCount from 'Database/models/empty_count'

const router = express.Router()

/**
 * Middleware
 */
router.use('/campuses/:vendor', CheckVendorMiddleware.handler())

/**
 * Sub router
 */
router.use('/campuses/:vendor/vacant', vacantRouter)

/**
 * Controller
 */
// show campus list
router.get('/campuses', LocaleMiddleware.handler(), CampusesController.index())

// router.get('/test', (req, res) => {
//   res.json({
//     result: 'test'
//   })
// })

export default router
