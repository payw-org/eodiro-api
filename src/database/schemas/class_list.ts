import mongoose from 'mongoose'
import { ClassDoc } from 'Database/schemas/class'

export interface ClassListDoc extends Document {
  year: string
  semester: string
  mainCourse: string
  classes: Array<string | ClassDoc>
}

const classListSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  mainCourse: { type: String, required: true },
  classes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }
  ]
})

export default classListSchema
