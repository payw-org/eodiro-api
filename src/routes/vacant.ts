import express from 'express'
import BuildingsController from 'Http/controllers/vacant/BuildingsController'
import CheckBuildingMiddleware from 'Http/middleware/CheckBuilding'

const router = express.Router()

/**
 * Middleware
 */
router.use('/buildings/:building', CheckBuildingMiddleware.handler())

/**
 * Controller
 */
// show building list
router.get('/buildings', BuildingsController.index())

export default router
