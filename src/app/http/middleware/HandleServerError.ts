import Middleware, { ErrorHandler } from 'Http/middleware/Middleware'
import logger from 'Configs/log'

export default class HandleServerError implements Middleware {
  handler(): ErrorHandler {
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
