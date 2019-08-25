/**
 * Schema for a university
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'
import globalNameSchema, { GlobalNameDoc } from './global_name'
import { BuildingDoc } from './building'
import classListSchema, { ClassListDoc } from 'Database/schemas/class_list'

export interface UniversityDoc extends Document {
  name: GlobalNameDoc
  campus?: GlobalNameDoc
  vendor: string
  buildings: Array<string | BuildingDoc>
  classLists: Array<ClassListDoc>
}

const universitySchema = new mongoose.Schema({
  name: { type: globalNameSchema, required: true },
  campus: { type: globalNameSchema },
  vendor: { type: String, required: true, unique: true },
  buildings: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true }
  ],
  classLists: [{ type: classListSchema, required: true }]
})

export default universitySchema
