import { Response, NextHandler } from 'Http/RequestHandler'

export default class Locale {
  private static supportedCodes = [
    'kr', // default language
    'en'
  ]

  /**
   * Check and set language code.
   */
  public static handler(): NextHandler {
    return (req, res, next): Response | void => {
      // check if language code is not set
      if (!Object.prototype.hasOwnProperty.call(req.body, 'language')) {
        req.body.language = this.supportedCodes[0] // set to default language

        return next()
      }

      // check if language code is valid
      req.body.language = req.body.language.toLowerCase()
      if (!this.supportedCodes.includes(req.body.language)) {
        return res.status(400).json({
          err: {
            msg: 'Not supported language code.'
          }
        })
      }

      return next()
    }
  }
}
