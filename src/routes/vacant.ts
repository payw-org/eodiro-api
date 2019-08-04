import express from 'express'
import BuildingsController from 'Http/controllers/vacant/BuildingsController'
import CheckBuildingMiddleware from 'Http/middleware/CheckBuilding'
import FloorsController from 'Http/controllers/vacant/FloorsController'
import CheckFloorMiddleware from 'Http/middleware/CheckFloor'

const router = express.Router()

/**
 * Middleware
 */
router.use('/buildings/:building', CheckBuildingMiddleware.handler())
router.use('/buildings/:building/floors/:floor', CheckFloorMiddleware.handler())

/**
 * Controller
 */
// show building list of the university
router.get('/buildings', BuildingsController.index())

// show floor list of the building
router.get('/buildings/:building/floors', FloorsController.index())

export default router
