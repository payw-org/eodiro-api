import Middleware from 'Http/middleware/Middleware'
import { SimpleHandler } from 'Http/RequestHandler'

export default class HandleClientError implements Middleware {
  public handler(): SimpleHandler {
    return (req, res) => {
      res.status(404).json({
        err: {
          msg: 'Request not found'
        }
      })
    }
  }
}
