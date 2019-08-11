/**
 * Schema for empty classroom count info of a building.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import emptyFacilitySchema, {
  EmptyFacilityDoc
} from 'Database/schemas/empty_facility'

export interface EmptyBuildingDoc extends EmptyFacilityDoc {
  floors: EmptyFacilityDoc[]
}

const emptyBuildingSchema = emptyFacilitySchema.add({
  floors: [{ type: emptyFacilitySchema, required: true }] // empty classroom count info of floors
})

export default emptyBuildingSchema
