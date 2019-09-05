import mongoose from 'mongoose'
import dayMealSchema from 'Database/schemas/day-meal'

export default mongoose.model('DayMeal', dayMealSchema)
