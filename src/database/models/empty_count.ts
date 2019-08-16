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

// set tick minute unit
export const tick_min = 5

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
  const count = <EmptyCountDoc>await this.findOne(
    {
      time: TimeManager.getCurrentTick(tick_min),
      'buildings.id': building_id
    },
    { _id: 0, 'buildings.$': 1 }
  )

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
  const count = <EmptyCountDoc>await this.findOne(
    {
      time: TimeManager.getCurrentTick(tick_min),
      'buildings.id': building_id
    },
    { _id: 0, 'buildings.$': 1 }
  )

  const floors = count.buildings[0].floors
  const floor = floors.find(elem => {
    return elem.id == floor_id
  })

  return floor
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
