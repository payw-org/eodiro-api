/**
 * Schema for a building
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'
import { UniversityDoc } from './university'
import { FloorDoc } from './floor'

export interface BuildingDoc extends Document {
  university?: string | UniversityDoc
  number: string
  name: string
  floors: Array<string | FloorDoc>
}

const buildingSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  number: { type: String, required: true },
  name: { type: String, required: true },
  floors: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true }
  ]
})

export default buildingSchema
