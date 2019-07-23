import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Express, Request, Response, NextFunction } from 'express'
import router from 'Routes/api'
import logger from 'Configs/log'

export default class RouteServiceProvider {
  private app: Express

  private basicMiddleware = [
    bodyParser.urlencoded({ extended: true }),
    bodyParser.json(),
    cors()
  ]

  private errorHandlerMiddleware = [
    (req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({ err: { msg: 'Invalid request' } })
    },

    (err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error(err.stack)
      res.status(500).json({ err: { msg: 'Internal server error' } })
    }
  ]

  public constructor() {
    this.app = express()
  }

  public boot() {
    this.app.use(this.basicMiddleware)
    this.app.use(router)
    this.app.use(this.errorHandlerMiddleware)

    return this.app
  }
}
