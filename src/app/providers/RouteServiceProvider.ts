import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Express } from 'express'
import router from 'Routes/api'
import HandleClientError from 'Http/middleware/HandleClientError'
import HandleServerError from 'Http/middleware/HandleServerError'

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
