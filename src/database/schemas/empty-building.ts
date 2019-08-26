/**
 * Schema for empty classroom count info of a building.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose from 'mongoose'

import emptyFacilitySchema, {
  EmptyFacilityDoc
} from 'Database/schemas/empty-facility'

export interface EmptyBuildingDoc extends EmptyFacilityDoc {
  floors: EmptyFacilityDoc[]
}

const emptyBuildingSchema = new mongoose.Schema({
  id: { type: String, required: true }, // facility document id
  empty: { type: Number, required: true }, // empty classroom count
  total: { type: Number, required: true }, // total classroom count
  floors: [{ type: emptyFacilitySchema, required: true }] // empty classroom count info of floors
})

export default emptyBuildingSchema
