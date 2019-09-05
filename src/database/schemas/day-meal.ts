import mongoose, { Document } from 'mongoose'
import restaurantSchema, { RestaurantDoc } from 'Database/schemas/restaurant'

export interface DayMealDoc extends Document {
  date: Date
  breakfast?: RestaurantDoc[]
  lunch?: RestaurantDoc[]
  supper?: RestaurantDoc[]
}

const dayMealSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  breakfast: [{ type: restaurantSchema }],
  lunch: [{ type: restaurantSchema }],
  supper: [{ type: restaurantSchema }]
})

export default dayMealSchema
