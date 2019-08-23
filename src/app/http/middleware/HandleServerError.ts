import { Response, ErrorHandler } from 'Http/RequestHandler'
import LogHelper from 'Helpers/LogHelper'

export default class HandleServerError {
  /**
   * Handle 500 http error.
   */
  public static handler(): ErrorHandler {
    return (err, req, res): Response => {
      LogHelper.log('error', err.stack)

      return res.status(500).json({
        err: {
          msg: 'Internal server error'
        }
      })
    }
  }
}
