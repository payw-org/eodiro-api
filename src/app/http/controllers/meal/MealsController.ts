import { Response, SimpleHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import { UniversityDoc } from 'Database/schemas/university'
import { DayMealDoc } from 'Database/schemas/day-meal'
import DayMeal from 'Database/models/day-meal'

interface IndexResponseBody {
  meals: DayMealDoc[]
}

interface GetResponseBody {
  meal: DayMealDoc
}

export default class MealsController {
  /**
   * Get a listing of the meal.
   */
  public static index(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const univId = res.locals.univId

      // find all dayMeal document of the university
      const univ = (await University.findById(univId, { _id: 0, meals: 1 })
        .lean()
        .populate({
          path: 'meals',
          select:
            '-_id -__v -breakfast._id -breakfast.meals._id -lunch._id -lunch.meals._id -supper._id -supper.meals._id'
        })) as UniversityDoc

      const meals = univ.meals as DayMealDoc[]

      // if meal list not exist
      if (meals.length === 0) {
        return res.status(404).json({
          err: {
            msg: 'Meals not found.'
          }
        })
      }

      const responseBody: IndexResponseBody = {
        meals: meals
      }

      return res.status(200).json(responseBody)
    }
  }

  /**
   * Check if the meal exists
   */
  public static head(): SimpleHandler {
    return (req, res): Response => {
      return res.status(204).json({})
    }
  }

  /**
   * Get a specific meal.
   */
  public static get(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const mealId = res.locals.mealId

      const meal = (await DayMeal.findById(mealId, {
        _id: 0,
        __v: 0,
        'breakfast._id': 0,
        'breakfast.meals._id': 0,
        'lunch._id': 0,
        'lunch.meals._id': 0,
        'supper._id': 0,
        'supper.meals._id': 0
      }).lean()) as DayMealDoc

      const responseBody: GetResponseBody = {
        meal: meal
      }

      return res.status(200).json(responseBody)
    }
  }
}
