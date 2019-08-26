/**
 * Model for empty classroom count info which calculated in advance.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Model } from 'mongoose'
import emptyCountSchema, { EmptyCountDoc } from '../schemas/empty-count'
import TimeManager from 'Helpers/TimeManager'
import EmptyClassroomHelper from 'Helpers/EmptyClassroomHelper'
import { EmptyBuildingDoc } from 'Database/schemas/empty-building'
import { EmptyFacilityDoc } from 'Database/schemas/empty-facility'

// define static methods which are frequently used for `EmptyCount` model
interface EmptyCountModel extends Model<EmptyCountDoc> {
  saveCurrentCount(): Promise<void>
  saveNextCount(): Promise<void>
  getCurrentCountOfBuilding(buildingId: string): Promise<EmptyBuildingDoc>
  getCurrentCountOfFloor(
    buildingId: string,
    floorId: string
  ): Promise<EmptyFacilityDoc>
  deletePrevCounts(): Promise<void>
}

/**
 * set config data
 */
const tickMin = 5 // every 5 minutes
// MON - SAT, 7:55AM - 24:05AM
const sDay = 1
const eDay = 6
const sHour = 7
const eHour = 0
const sMin = 55
const eMin = 5

export { tickMin, sDay, sHour, sMin, eDay, eHour, eMin }

/**
 * Calculate and save current tick time's empty classroom count.
 */
emptyCountSchema.statics.saveCurrentCount = async function(): Promise<void> {
  const currentTick = TimeManager.getCurrentTick(tickMin)

  // if not exist
  if ((await this.countDocuments({ time: currentTick })) === 0) {
    const countInfo = await EmptyClassroomHelper.countAll(currentTick)
    await this.create({ time: currentTick, buildings: countInfo })
  }
}

/**
 * Calculate and save next tick time's empty classroom count.
 */
emptyCountSchema.statics.saveNextCount = async function(): Promise<void> {
  const nextTick = TimeManager.getNextTick(tickMin)

  // if not exist
  if ((await this.countDocuments({ time: nextTick })) === 0) {
    const countInfo = await EmptyClassroomHelper.countAll(nextTick)
    await this.create({ time: nextTick, buildings: countInfo })
  }
}

/**
 * Return current tick time's empty classroom count for a building.
 *
 * @param buildingId
 */
emptyCountSchema.statics.getCurrentCountOfBuilding = async function(
  buildingId: string
): Promise<EmptyBuildingDoc> {
  const currentTick = TimeManager.getCurrentTick(tickMin)
  let count

  // activation time
  if (
    TimeManager.isDateInRange(new Date(), sDay, eDay, sHour, eHour, sMin, eMin)
  ) {
    // get current tick time's empty classroom count
    count = (await this.findOne(
      {
        time: currentTick,
        'buildings.id': buildingId
      },
      { _id: 0, 'buildings.$': 1 }
    )) as EmptyCountDoc
  } else {
    // get last tick time's empty classroom count
    count = (await this.findOne(
      {
        time: { $lte: currentTick }, // not future
        'buildings.id': buildingId
      },
      { _id: 0, 'buildings.$': 1 }
    ).sort('-time')) as EmptyCountDoc
  }

  return count.buildings[0]
}

/**
 * Return current tick time's empty classroom count for a floor.
 *
 * @param buildingId
 * @param floorId
 */
emptyCountSchema.statics.getCurrentCountOfFloor = async function(
  buildingId: string,
  floorId: string
): Promise<EmptyFacilityDoc> {
  const buildingCount = await this.getCurrentCountOfBuilding(buildingId)
  const floorCount = buildingCount.floors.find((elem: EmptyFacilityDoc) => {
    return elem.id.toString() === floorId.toString()
  })

  return floorCount
}

/**
 * Delete all previous tick time's empty classroom counts.
 */
emptyCountSchema.statics.deletePrevCounts = async function(): Promise<void> {
  const currentTick = TimeManager.getCurrentTick(tickMin)
  await this.deleteMany({ time: { $lt: currentTick } })
}

export default mongoose.model<EmptyCountDoc, EmptyCountModel>(
  'EmptyCount',
  emptyCountSchema,
  'emptyCounts'
)
