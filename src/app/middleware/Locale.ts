import Middleware, {
  Request,
  Response,
  NextFunction,
  NextHandler
} from 'Middleware/Middleware'

export default class Locale implements Middleware {
  private supportedLanguageCodes = [
    'kr', // main language
    'en'
  ]

  handler(): NextHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      // check if language code is not set
      if (!req.body.hasOwnProperty('language')) {
        req.body.language = this.supportedLanguageCodes[0] // set to main language
        next()
      }

      // check if language code is exist
      if (!this.supportedLanguageCodes.includes(req.body.language)) {
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
