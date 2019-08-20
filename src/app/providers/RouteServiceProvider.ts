import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
import express, { Express } from 'express'
import router from 'Routes/api'
import HandleClientError from 'Http/middleware/HandleClientError'
import HandleServerError from 'Http/middleware/HandleServerError'

export default class RouteServiceProvider {
  /**
   * Main router
   */
  private readonly app: Express

  /**
   * Basic middleware list which is globally applied to router.
   */
  private basicMiddleware = [
    helmet(),
    cors(),
    bodyParser.urlencoded({ extended: true }),
    bodyParser.json()
  ]

  /**
   * Error handler middleware list which handle http error.
   */
  private errorHandlerMiddleware = [
    HandleClientError.handler(),
    HandleServerError.handler()
  ]

  /**
   * Initialize main router.
   */
  public constructor() {
    this.app = express()
  }

  /**
   * Boot main router.
   */
  public boot(): Express {
    this.app.use(this.basicMiddleware)
    this.app.use('/v2', router) // version 2
    this.app.use(this.errorHandlerMiddleware)

    return this.app
  }
}
