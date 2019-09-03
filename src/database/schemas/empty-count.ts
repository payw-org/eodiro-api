/**
 * Schema for empty classroom count info which calculated in advance.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'
import emptyBuildingSchema, {
  EmptyBuildingDoc
} from 'Database/schemas/empty-building'

export interface EmptyCountDoc extends Document {
  time: Date
  buildings: EmptyBuildingDoc[]
}

const emptyCountSchema = new mongoose.Schema({
  time: { type: Date, required: true }, // base time
  buildings: [{ type: emptyBuildingSchema, required: true }] // empty classroom count info of buildings
})

export default emptyCountSchema
