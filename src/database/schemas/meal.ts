import mongoose, { Document } from 'mongoose'

export interface MealDoc extends Document {
  time: string
  title: string
  price: string
  menus: string[]
}

const mealSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: String, required: true },
  menus: [{ type: String, required: true }]
})

export default mealSchema
