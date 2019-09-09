import { Response, NextHandler } from 'Http/RequestHandler'
import { checkSchema, ValidationChain } from 'express-validator'

export default class Locale {
  private static supportedCodes = [
    'kr', // default language
    'en'
  ]

  public static validate(): ValidationChain[] {
    /**
     * Validate middleware request.
     */
    return checkSchema({
      language: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        customSanitizer: {
          options: (value): string => {
            return value.toLowerCase()
          }
        },
        isIn: {
          options: [this.supportedCodes],
          errorMessage: 'Not supported language code.'
        },
        errorMessage: '`language` must be an language code.'
      }
    })
  }

  /**
   * Set language code.
   */
  public static handler(): NextHandler {
    return (req, res, next): Response | void => {
      req.body.language = req.body.language || this.supportedCodes[0]

      return next()
    }
  }
}
