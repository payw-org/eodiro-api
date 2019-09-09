import { Response, NextHandler } from 'Http/RequestHandler'
import Floor from 'Database/models/floor'
import LogHelper from 'Helpers/LogHelper'
import { checkSchema, ValidationChain } from 'express-validator'

export default class CheckFloor {
  /**
   * Validate middleware request.
   */
  public static validate(): ValidationChain[] {
    return checkSchema({
      floor: {
        exists: true,
        in: 'params',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`floor` must be string.'
      }
    })
  }

  /**
   * Check if floor is not exist and pass floor id.
   */
  public static handler(): NextHandler {
    return async (req, res, next): Promise<Response | void> => {
      const bldgId = res.locals.bldgId
      const floorNum = req.params.floor

      // find floor id
      const floor = await Floor.findOne(
        {
          building: bldgId,
          number: { $regex: new RegExp('^' + floorNum.toLowerCase(), 'i') }
        },
        { _id: 1 },
        err => {
          if (err) {
            LogHelper.log('error', err)
          }
        }
      ).lean()

      // if not found
      if (!floor) {
        return res.status(404).json({
          err: {
            msg: 'Floor not found.'
          }
        })
      }

      // pass the floor document id
      res.locals.floorId = floor._id

      return next()
    }
  }
}
