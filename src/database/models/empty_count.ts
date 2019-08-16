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
import { EmptyFacilityDoc } from 'Database/schemas/empty_facility'

interface EmptyCountModel extends Model<EmptyCountDoc> {
  saveCurrentCount(): Promise<void>
  saveNextCount(): Promise<void>
  getCurrentCountOfBuilding(building_id: string): Promise<EmptyFacilityDoc>
  getCurrentCountOfFloor(
    building_id: string,
    floor_id: string
  ): Promise<EmptyFacilityDoc>
  deletePrevCounts(): Promise<void>
}

export const tick_min = 5

emptyCountSchema.statics.saveCurrentCount = async function() {
  const current_tick = TimeManager.getCurrentTick(tick_min)

  if ((await this.countDocuments({ time: current_tick })) === 0) {
    const count_info = await EmptyClassroomHelper.countAll(current_tick)
    await this.create({ time: current_tick, buildings: count_info })
  }
}

emptyCountSchema.statics.saveNextCount = async function() {
  const next_tick = TimeManager.getNextTick(tick_min)

  if ((await this.countDocuments({ time: next_tick })) === 0) {
    const count_info = await EmptyClassroomHelper.countAll(next_tick)
    await this.create({ time: next_tick, buildings: count_info })
  }
}

emptyCountSchema.statics.getCurrentCountOfBuilding = async function(
  building_id: string
) {
  const count = <EmptyCountDoc>await this.findOne(
    {
      time: TimeManager.getCurrentTick(tick_min),
      'buildings.id': building_id
    },
    { _id: 0, 'buildings.$': 1 }
  )

  const building = count.buildings[0]

  return { id: building.id, empty: building.empty, total: building.total }
}

emptyCountSchema.statics.getCurrentCountOfFloor = async function(
  building_id: string,
  floor_id: string
) {
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

  return { id: floor.id, empty: floor.empty, total: floor.total }
}

emptyCountSchema.statics.deletePrevCounts = async function() {
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
