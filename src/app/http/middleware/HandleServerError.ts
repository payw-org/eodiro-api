import { Response, ErrorHandler } from 'Http/RequestHandler'
import logger from 'Configs/log'

export default class HandleServerError {
  /**
   * Handle 500 http error.
   */
  public static handler(): ErrorHandler {
    return (err, req, res): Response => {
      logger.error(err.stack)

      return res.status(500).json({
        err: {
          msg: 'Internal server error'
        }
      })
    }
  }
}
