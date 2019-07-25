import Middleware from 'Http/middleware/Middleware'
import { NextHandler } from 'Http/RequestHandler'

export default class Locale implements Middleware {
  private supportedCodes = [
    'kr', // main language
    'en'
  ]

  handler(): NextHandler {
    return (req, res, next) => {
      // check if language code is not set
      if (!req.body.hasOwnProperty('language')) {
        req.body.language = this.supportedCodes[0] // set to main language
        next()
      }

      req.body.language = req.body.language.toLowerCase()

      // check if language code is exist
      if (!this.supportedCodes.includes(req.body.language.toLowerCase())) {
        res.status(406).json({
          err: {
            msg: 'Not supported language code'
          }
        })
      }

      next()
    }
  }
}
