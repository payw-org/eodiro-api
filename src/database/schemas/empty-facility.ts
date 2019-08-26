/**
 * Schema for empty classroom count info of a facility.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'

export interface EmptyFacilityDoc extends Document {
  id: string
  empty: number
  total: number
}

const emptyFacilitySchema = new mongoose.Schema({
  id: { type: String, required: true }, // facility document id
  empty: { type: Number, required: true }, // empty classroom count
  total: { type: Number, required: true } // total classroom count
})

export default emptyFacilitySchema
