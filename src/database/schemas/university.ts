/**
 * Schema for a university
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'
import globalNameSchema, { GlobalNameDoc } from './global-name'
import { BuildingDoc } from './building'
import { ClassListDoc } from 'Database/schemas/class-list'
import { DayMealDoc } from 'Database/schemas/day-meal'

export interface UniversityDoc extends Document {
  name: GlobalNameDoc
  campus?: GlobalNameDoc
  vendor: string
  buildings: Array<string | BuildingDoc>
  classLists: Array<string | ClassListDoc>
  meals: Array<string | DayMealDoc>
}

const universitySchema = new mongoose.Schema({
  name: { type: globalNameSchema, required: true },
  campus: { type: globalNameSchema },
  vendor: { type: String, required: true, unique: true },
  buildings: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true }
  ],
  classLists: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'ClassList', required: true }
  ],
  meals: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'DayMeal', required: true }
  ]
})

export default universitySchema
