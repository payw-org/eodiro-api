import { Response, NextHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import { UniversityDoc } from 'Database/schemas/university'
import { DayMealDoc } from 'Database/schemas/day-meal'

export default class CheckMealDate {
  /**
   * Check if the meal is not exist and pass the meal id.
   */
  public static handler(): NextHandler {
    return async (req, res, next): Promise<Response | void> => {
      const univId = res.locals.univId
      const date = req.params.date

      // find the specific date's meal of the university
      const univ = (await University.findById(univId, { _id: 0, meals: 1 })
        .lean()
        .populate({
          path: 'meals',
          match: { date: date }
        })) as UniversityDoc

      // if not found
      if (!univ.meals[0]) {
        return res.status(404).json({
          err: {
            msg: 'Meal not found.'
          }
        })
      }

      // pass the meal document id
      res.locals.mealId = (univ.meals[0] as DayMealDoc)._id

      return next()
    }
  }
}
