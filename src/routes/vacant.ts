import express from 'express'
import BuildingsController from 'Http/controllers/vacant/BuildingsController'

const router = express.Router()

// show building list
router.get('/buildings', BuildingsController.index())

export default router
