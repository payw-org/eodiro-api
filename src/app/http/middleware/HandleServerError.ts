import Middleware from 'Http/middleware/Middleware'
import { ErrorHandler } from 'Http/RequestHandler'
import logger from 'Configs/log'

export default class HandleServerError implements Middleware {
  public handler(): ErrorHandler {
    return (err, req, res, next) => {
      logger.error(err.stack)
      res.status(500).json({
        err: {
          msg: 'Internal server error'
        }
      })
    }
  }
}
