import Middleware, { SimpleHandler } from 'Http/middleware/Middleware'

export default class HandleClientError implements Middleware {
  handler(): SimpleHandler {
    return (req, res) => {
      res.status(404).json({
        err: {
          msg: 'Request not found'
        }
      })
    }
  }
}
