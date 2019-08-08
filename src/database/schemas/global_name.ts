/**
 * Schema for a global name
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose, { Document } from 'mongoose'

export interface GlobalNameDoc extends Document {
  [index: string]: string | any
  kr: string
  en: string
  zh?: string
  fr?: string
}

const globalNameSchema = new mongoose.Schema({
  kr: { type: String, required: true },
  en: { type: String, required: true },
  zh: { type: String },
  fr: { type: String }
})

export default globalNameSchema
