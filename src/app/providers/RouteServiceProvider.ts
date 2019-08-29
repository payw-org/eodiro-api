import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
import session from 'express-session'
import uuidv5 from 'uuid/v5'
import connectMongo from 'connect-mongo'
import mongoose from 'mongoose'
import express, { Express } from 'express'
import router from 'Routes/api'
import HandleClientError from 'Http/middleware/HandleClientError'
import HandleServerError from 'Http/middleware/HandleServerError'

const MongoStore = connectMongo(session)

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
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    session({
      genid: () => {
        return uuidv5(process.env.UUID_DNS, uuidv5.DNS)
      },
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      name: process.env.SESSION_NAME,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
      cookie: {
        secure: true
      }
    })
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
    this.app.set('trust proxy', 1) // trust first proxy
    this.app.use(this.basicMiddleware)
    this.app.use('/v2', router) // versioning
    this.app.use(this.errorHandlerMiddleware)

    return this.app
  }
}
