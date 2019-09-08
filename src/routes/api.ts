import express from 'express'
import LocaleMiddleware from 'Http/middleware/Locale'
import CheckVendorMiddleware from 'Http/middleware/CheckVendor'
import CampusesController from 'Http/controllers/CampusesController'
import vacantRouter from 'Routes/vacant'
import inquiryRouter from 'Routes/inquiry'
import searchClassRouter from 'Routes/./search-class'
import mealRouter from 'Routes/meal'

const router = express.Router()

/**
 * Middleware
 */
router.use('/campuses/:vendor', CheckVendorMiddleware.handler())

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
router.get('/campuses', LocaleMiddleware.handler(), CampusesController.index())

// router.get('/test', (req, res) => {
//   LogHelper.log('info', 'logger test')
//
//   res.json({
//     result: 'good'
//   })
// })

export default router
