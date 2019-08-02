import express from 'express'
import UniversityListController from 'Http/controllers/vacant/UniversityListController'
import BuildingListController from 'Http/controllers/vacant/BuildingListController'
import FloorListController from 'Http/controllers/vacant/FloorListController'
import ClassroomListController from 'Http/controllers/vacant/ClassroomListController'
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
 * Controller
 */
// show campus list
router.get('/campuses', LocaleMiddleware.handler(), CampusesController.index())

// // University list data
// router.get('/university', async (req, res) => {
//   const controller = new UniversityListController()
//
//   try {
//     const univ_list = await controller.getList(req.body.language)
//
//     res.json({ err: false, universities: univ_list })
//   } catch (err) {
//     res.json({ err: true, msg: err })
//   }
// })
//
// // Building list data
// router.get('/:vendor', async (req, res) => {
//   const controller = new BuildingListController()
//
//   try {
//     const building_list = await controller.getList(req.params.vendor)
//
//     res.json({ err: false, buildings: building_list })
//   } catch (err) {
//     res.json({ err: true, msg: err })
//   }
// })
//
// // Building list data include number of empty classrooms
// router.get('/:vendor/empty', async (req, res) => {
//   const controller = new BuildingListController()
//
//   try {
//     const building_list = await controller.getListIncludeEmptyNum(
//       req.params.vendor
//     )
//
//     res.json({ err: false, buildings: building_list })
//   } catch (err) {
//     res.json({ err: true, msg: err })
//   }
// })
//
// // Floor list data
// router.get('/:vendor/:building_num', async (req, res) => {
//   const controller = new FloorListController()
//
//   try {
//     const floor_list = await controller.getList(
//       req.params.vendor,
//       req.params.building_num
//     )
//
//     res.json({ err: false, floors: floor_list })
//   } catch (err) {
//     res.json({ err: true, msg: err })
//   }
// })
//
// // Floor list data include number of empty classrooms
// router.get('/:vendor/:building_num/empty', async (req, res) => {
//   const controller = new FloorListController()
//
//   try {
//     const floor_list = await controller.getListIncludeEmptyNum(
//       req.params.vendor,
//       req.params.building_num
//     )
//
//     res.json({ err: false, floors: floor_list })
//   } catch (err) {
//     res.json({ err: true, msg: err })
//   }
// })
//
// // Classroom list data
// router.get('/:vendor/:building_num/:floor_num', async (req, res) => {
//   const controller = new ClassroomListController()
//
//   try {
//     const classroom_list = await controller.getList(
//       req.params.vendor,
//       req.params.building_num,
//       req.params.floor_num.toUpperCase()
//     )
//
//     res.json({ err: false, classrooms: classroom_list })
//   } catch (err) {
//     res.json({ err: true, msg: err })
//   }
// })

export default router
