import { SimpleHandler } from 'Http/RequestHandler'

export default class HandleClientError {
  public static handler(): SimpleHandler {
    return (req, res) => {
      res.status(404).json({
        err: {
          msg: 'Request not found'
        }
      })
    }
  }
}
