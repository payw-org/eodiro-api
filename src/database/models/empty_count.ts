/**
 * Model for empty classroom count info which calculated in advance.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Model } from 'mongoose'
import emptyCountSchema, { EmptyCountDoc } from '../schemas/empty_count'
import TimeManager from 'Helpers/TimeManager'
import EmptyClassroomHelper from 'Helpers/EmptyClassroomHelper'
import { EmptyBuildingDoc } from 'Database/schemas/empty_building'
import { EmptyFacilityDoc } from 'Database/schemas/empty_facility'

// define static methods which are frequently used for `EmptyCount` model
interface EmptyCountModel extends Model<EmptyCountDoc> {
  saveCurrentCount(): Promise<void>
  saveNextCount(): Promise<void>
  getCurrentCountOfBuilding(building_id: string): Promise<EmptyBuildingDoc>
  getCurrentCountOfFloor(
    building_id: string,
    floor_id: string
  ): Promise<EmptyFacilityDoc>
  deletePrevCounts(): Promise<void>
}

/**
 * set config data
 */
const tick_min = 5 // every 5 minutes
// MON - SAT, 7:55AM - 24:05AM
const s_day = 1
const e_day = 6
const s_hour = 7
const e_hour = 0
const s_min = 55
const e_min = 5

export { tick_min, s_day, s_hour, s_min, e_day, e_hour, e_min }

/**
 * Calculate and save current tick time's empty classroom count.
 */
emptyCountSchema.statics.saveCurrentCount = async function(): Promise<void> {
  const current_tick = TimeManager.getCurrentTick(tick_min)

  // if not exist
  if ((await this.countDocuments({ time: current_tick })) === 0) {
    const count_info = await EmptyClassroomHelper.countAll(current_tick)
    await this.create({ time: current_tick, buildings: count_info })
  }
}

/**
 * Calculate and save next tick time's empty classroom count.
 */
emptyCountSchema.statics.saveNextCount = async function(): Promise<void> {
  const next_tick = TimeManager.getNextTick(tick_min)

  // if not exist
  if ((await this.countDocuments({ time: next_tick })) === 0) {
    const count_info = await EmptyClassroomHelper.countAll(next_tick)
    await this.create({ time: next_tick, buildings: count_info })
  }
}

/**
 * Return current tick time's empty classroom count for a building.
 *
 * @param building_id
 */
emptyCountSchema.statics.getCurrentCountOfBuilding = async function(
  building_id: string
): Promise<EmptyBuildingDoc> {
  const current_tick = TimeManager.getCurrentTick(tick_min)
  let count

  // activation time
  if (
    TimeManager.isDateInRange(
      new Date(),
      s_day,
      e_day,
      s_hour,
      e_hour,
      s_min,
      e_min
    )
  ) {
    // get current tick time's empty classroom count
    count = <EmptyCountDoc>await this.findOne(
      {
        time: current_tick,
        'buildings.id': building_id
      },
      { _id: 0, 'buildings.$': 1 }
    )
  }
  // inactivation time
  else {
    // get last tick time's empty classroom count
    count = <EmptyCountDoc>await this.findOne(
      {
        time: { $lte: current_tick }, // not future
        'buildings.id': building_id
      },
      { _id: 0, 'buildings.$': 1 }
    ).sort('-time')
  }

  return count.buildings[0]
}

/**
 * Return current tick time's empty classroom count for a floor.
 *
 * @param building_id
 * @param floor_id
 */
emptyCountSchema.statics.getCurrentCountOfFloor = async function(
  building_id: string,
  floor_id: string
): Promise<EmptyFacilityDoc> {
  const building_count = await this.getCurrentCountOfBuilding(building_id)
  const floor_count = building_count.floors.find((elem: EmptyFacilityDoc) => {
    return elem.id == floor_id
  })

  return floor_count
}

/**
 * Delete all previous tick time's empty classroom counts.
 */
emptyCountSchema.statics.deletePrevCounts = async function(): Promise<void> {
  const current_tick = TimeManager.getCurrentTick(tick_min)
  await this.deleteMany({ time: { $lt: current_tick } })
}

export default <EmptyCountModel>(
  mongoose.model<EmptyCountDoc, EmptyCountModel>(
    'EmptyCount',
    emptyCountSchema,
    'emptyCounts'
  )
)
