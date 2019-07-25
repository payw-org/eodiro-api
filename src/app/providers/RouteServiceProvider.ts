import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Express } from 'express'
import router from 'Routes/api'
import HandleClientError from 'Middleware/HandleClientError'
import HandleServerError from 'Middleware/HandleServerError'

export default class RouteServiceProvider {
  private app: Express

  private basicMiddleware = [
    bodyParser.urlencoded({ extended: true }),
    bodyParser.json(),
    cors()
  ]

  private errorHandlerMiddleware = [
    new HandleClientError().handler(),
    new HandleServerError().handler()
  ]

  public constructor() {
    this.app = express()
  }

  public boot(): Express {
    this.app.use(this.basicMiddleware)
    this.app.use(router)
    this.app.use(this.errorHandlerMiddleware)

    return this.app
  }
}
