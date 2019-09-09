import mongoose, { Document } from 'mongoose'
import mealSchema, { MealDoc } from 'Database/schemas/meal'

export interface RestaurantDoc extends Document {
  name: string
  meals: MealDoc[]
}

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  meals: [{ type: mealSchema, required: true }]
})

export default restaurantSchema
