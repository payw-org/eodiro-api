/**
 * Schema for lecture time
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'

export interface TimeDoc extends Document {
  day: number
  start: string
  end: string
}

const timeSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // SUN - SAT => 0 - 6
  start: { type: String, required: true }, // ex. 3:30pm -> 1530
  end: { type: String, required: true }
})

export default timeSchema
