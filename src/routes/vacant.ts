import express from 'express'
import BuildingsController from 'Http/controllers/vacant/BuildingsController'
import CheckBuildingMiddleware from 'Http/middleware/CheckBuilding'
import FloorsController from 'Http/controllers/vacant/FloorsController'

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

// show floor list of the building
router.get('/buildings/:building/floors', FloorsController.index())

export default router
