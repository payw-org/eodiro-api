/**
 * Schema for class
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'
import locationSchema, { LocationDoc } from './location'
import timeSchema, { TimeDoc } from './time'

export interface ClassDoc extends Document {
  classId: string
  name: string
  instructor: string
  college: string
  subject: string
  grade: string
  course: string
  type: string
  unit: string
  term: string
  closed: boolean
  flexible: string
  note: string
  locations: LocationDoc[]
  times: TimeDoc[]
}

const classSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  name: { type: String, required: true },
  instructor: { type: String, default: '' },
  college: { type: String, default: '' },
  subject: { type: String, default: '' },
  grade: { type: String, default: '' },
  course: { type: String, default: '' },
  type: { type: String, default: '' },
  unit: { type: String, default: '' },
  term: { type: String, default: '' },
  closed: { type: Boolean, default: false },
  flexible: { type: String, default: '' },
  note: { type: String, default: '' },
  locations: [{ type: locationSchema, required: true }],
  times: [{ type: timeSchema, required: true }]
})

export default classSchema
